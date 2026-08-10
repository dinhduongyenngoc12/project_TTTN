# Tài liệu học và trình bày `AppController` trong dự án IoT Energy

## 1. Mục đích tài liệu

Tài liệu này giải thích vai trò của `src/Controller/AppController.php`, cách các controller khác kế thừa nó, luồng xác thực JWT, chuẩn hóa JSON response và kiểm tra quyền quản trị viên.

Mục tiêu là giúp sinh viên:

- hiểu code thay vì chỉ ghi nhớ;
- giải thích được kiến trúc controller trước hội đồng;
- phân biệt xác thực và phân quyền;
- giải thích được cơ chế nhận dữ liệu từ ESP32;
- trả lời được các câu hỏi phản biện thường gặp.

---

## 2. Vị trí của `AppController` trong kiến trúc

File chính:

```text
src/Controller/AppController.php
```

`AppController` kế thừa controller nền tảng của CakePHP:

```php
class AppController extends Controller
```

Các controller nghiệp vụ tiếp tục kế thừa `AppController`, ví dụ:

```php
class DevicesController extends AppController
```

```php
class ElectricityPriceTiersController extends AppController
```

Quan hệ kế thừa:

```text
Cake\Controller\Controller
            │
            ▼
App\Controller\AppController
            │
            ├── Api\UsersController
            ├── Api\DevicesController
            ├── Api\EnergyLogsController
            ├── Api\AlertConfigsController
            ├── Api\StatisticsController
            └── Api\ElectricityPriceTiersController
```

Nhờ cơ chế này, controller con có thể sử dụng các method dùng chung:

```php
$this->renderJson(...);
$this->success(...);
$this->error(...);
$this->getAuthenticatedUserId();
$this->getAuthenticatedUserRole();
$this->requireAdmin();
```

Mục đích là tránh lặp code xác thực, phân quyền và tạo JSON response trong từng controller.

---

## 3. Các trách nhiệm chính

`AppController` hiện có ba nhóm trách nhiệm:

```text
AppController
├── Cấu hình controller dùng chung
│   ├── Authentication component
│   ├── ngoại lệ xác thực cho ESP32
│   └── JSON view
│
├── Chuẩn hóa API response
│   ├── renderJson()
│   ├── success()
│   └── error()
│
└── Hỗ trợ xác thực và phân quyền
    ├── getAuthenticatedUserId()
    ├── getAuthenticatedUserRole()
    ├── requireAdmin()
    └── readIdentityValue()
```

`AppController` không nên chứa nghiệp vụ riêng của Device, EnergyLog hoặc bảng giá. Những nghiệp vụ đó phải nằm trong controller/service tương ứng.

---

## 4. Method `initialize()`

Code khái quát:

```php
public function initialize(): void
{
    parent::initialize();

    $this->loadComponent('Authentication.Authentication');

    if (
        $this->request->is('post')
        && rtrim($this->request->getUri()->getPath(), '/') === '/api/energy-logs'
    ) {
        $this->Authentication->disableIdentityCheck();
    }

    $this->viewBuilder()->setClassName('Json');
}
```

CakePHP tự gọi `initialize()` khi tạo controller để xử lý request.

### 4.1. `parent::initialize()`

```php
parent::initialize();
```

Lệnh này gọi phần khởi tạo của `Cake\Controller\Controller`.

Nó phải được gọi trước các thiết lập riêng để bảo đảm controller CakePHP được khởi tạo đầy đủ.

### 4.2. Nạp Authentication component

```php
$this->loadComponent('Authentication.Authentication');
```

Sau khi component được nạp, controller có thể sử dụng:

```php
$this->Authentication->getIdentity();
$this->Authentication->logout();
$this->Authentication->disableIdentityCheck();
```

Authentication Middleware xác định danh tính từ request. Trong dự án này, user đã đăng nhập gửi JWT qua header:

```http
Authorization: Bearer <access-token>
```

Sau khi JWT được kiểm tra, thông tin user được biểu diễn dưới dạng identity.

Identity có thể chứa:

```json
{
  "id": 5,
  "username": "user01",
  "email": "user01@example.com",
  "role": "user"
}
```

### 4.3. Ngoại lệ xác thực cho ESP32

```php
if (
    $this->request->is('post')
    && rtrim($this->request->getUri()->getPath(), '/') === '/api/energy-logs'
) {
    $this->Authentication->disableIdentityCheck();
}
```

ESP32 không đăng nhập bằng tài khoản người dùng và không có JWT. Thiết bị gửi dữ liệu đo bằng:

```http
POST /api/energy-logs
IOT-KEY: <iot-key-cua-bo-do>
Content-Type: application/json
```

Vì vậy request này được miễn kiểm tra identity user.

Điều kiện được giới hạn bởi cả HTTP method và đường dẫn:

| Request | Có miễn identity user không? |
|---|---:|
| `POST /api/energy-logs` | Có |
| `GET /api/energy-logs` | Không |
| `POST /api/devices` | Không |
| `PATCH /api/energy-logs/1` | Không |

Miễn JWT không đồng nghĩa với bỏ xác thực. `EnergyLogsController::add()` vẫn lấy API Key từ header, sau đó `EnergyLogsService` kiểm tra:

- API Key có tồn tại không;
- `iot_devices.status` có phải `active` không;
- bộ đo có đang liên kết với một Device active không.

Hai cơ chế xác thực:

```text
Người dùng React
    └── JWT Bearer Token

ESP32
    └──tên định danh IOT Key của bộ đo IoT
```

### 4.4. Chọn JSON view

```php
$this->viewBuilder()->setClassName('Json');
```

Thiết lập này yêu cầu CakePHP render JSON thay vì tìm template HTML.

Nó phù hợp vì backend hoạt động như REST API cho React và ESP32.

---

## 5. Method `renderJson()`

```php
protected function renderJson(array $data, int $status = 200): Response
{
    $this->set($data);
    $this->viewBuilder()->setOption('serialize', array_keys($data));

    return $this->response = $this->response
        ->withType('application/json')
        ->withStatus($status);
}
```

Đây là helper cơ sở để tạo JSON response.

### 5.1. Tham số

```php
array $data
```

Là dữ liệu cần serialize.

```php
int $status = 200
```

Là HTTP status; mặc định là `200 OK`.

### 5.2. `$this->set($data)`

```php
$this->set($data);
```

Nếu `$data` là:

```php
[
    'status' => 'success',
    'message' => 'Lấy dữ liệu thành công',
    'devices' => $devices,
]
```

CakePHP đưa ba biến này vào view layer.

### 5.3. Chỉ định field serialize

```php
$this->viewBuilder()->setOption(
    'serialize',
    array_keys($data)
);
```

`array_keys($data)` trả:

```php
['status', 'message', 'devices']
```

JSON view sẽ serialize đúng những field này.

### 5.4. Content-Type

```php
->withType('application/json')
```

Response có header:

```http
Content-Type: application/json
```

### 5.5. HTTP status

```php
->withStatus($status)
```

Một số status thường dùng:

| Status | Ý nghĩa | Ví dụ trong dự án |
|---:|---|---|
| 200 | Thành công | Lấy danh sách |
| 201 | Đã tạo | Tạo Device/EnergyLog |
| 400 | Request không hợp lệ | Thiếu tham số |
| 401 | Chưa xác thực | Không có identity/API Key sai |
| 403 | Không có quyền | User gọi API admin |
| 404 | Không tìm thấy | ID không tồn tại hoặc không thuộc user |
| 409 | Xung đột | Username/email trùng |
| 422 | Validation thất bại | Dữ liệu không đạt rule |
| 500 | Lỗi server | Không thể hoàn tất thao tác DB |

### 5.6. Ví dụ sử dụng

```php
$this->renderJson([
    'status' => 'success',
    'message' => 'Lấy danh sách thiết bị thành công',
    'devices' => $devices,
]);
```

Kết quả:

```json
{
  "status": "success",
  "message": "Lấy danh sách thiết bị thành công",
  "devices": []
}
```

---

## 6. Helper `success()`

```php
protected function success(
    array $data = [],
    string $message = 'Success',
    int $status = 200
) {
    return $this->renderJson([
        'status' => 'success',
        'message' => $message,
        'data' => $data,
    ], $status);
}
```

Method này chuẩn hóa response thành công:

```json
{
  "status": "success",
  "message": "...",
  "data": {}
}
```

Ví dụ:

```php
return $this->success(
    ['id' => $user->id],
    'Đăng ký thành công',
    201
);
```

Ưu điểm:

- giảm code lặp;
- response nhất quán;
- frontend dễ khai báo type.

---

## 7. Helper `error()`

```php
protected function error(
    string $message = 'Error',
    array $errors = [],
    int $status = 400
) {
    return $this->renderJson([
        'status' => 'error',
        'message' => $message,
        'errors' => $errors,
    ], $status);
}
```

Response lỗi có cấu trúc:

```json
{
  "status": "error",
  "message": "Dữ liệu không hợp lệ",
  "errors": {
    "name": {
      "_empty": "Tên không được để trống"
    }
  }
}
```

Frontend có thể lấy message bằng:

```ts
error.response?.data?.message
```

---

## 8. `getAuthenticatedUserId()`

```php
protected function getAuthenticatedUserId(): ?int
{
    $identity = $this->request->getAttribute('identity')
        ?? $this->Authentication->getIdentity();

    $userId = $this->readIdentityValue($identity, 'id');

    if ($userId === null) {
        $userId = $this->readIdentityValue($identity, 'sub');
    }

    return is_numeric($userId) ? (int)$userId : null;
}
```

Mục đích là lấy ID của user đã đăng nhập.

### 8.1. Hai nguồn identity

Nguồn ưu tiên:

```php
$this->request->getAttribute('identity')
```

Authentication Middleware thường gắn identity vào request.

Nguồn dự phòng:

```php
$this->Authentication->getIdentity()
```

### 8.2. Vì sao kiểm tra `id` và `sub`?

Một số payload dùng:

```json
{ "id": 5 }
```

Chuẩn JWT thường dùng claim `sub`:

```json
{ "sub": 5 }
```

Code hỗ trợ cả hai để tránh phụ thuộc một representation duy nhất.

### 8.3. Kết quả

| Tình huống | Kết quả |
|---|---|
| Identity có `id = 5` | `5` kiểu `int` |
| Identity chỉ có `sub = 5` | `5` kiểu `int` |
| Không có identity | `null` |
| ID không phải số | `null` |

### 8.4. Ứng dụng trong phân tách dữ liệu

```php
$userId = $this->getAuthenticatedUserId();

$query->where([
    'Devices.user_id' => $userId,
]);
```

Điều này giúp user chỉ xem dữ liệu thuộc về mình.

---

## 9. `getAuthenticatedUserRole()`

```php
protected function getAuthenticatedUserRole(): ?string
{
    $identity = $this->request->getAttribute('identity')
        ?? $this->Authentication->getIdentity();

    $role = $this->readIdentityValue($identity, 'role');

    return is_string($role)
        ? strtolower(trim($role))
        : null;
}
```

Method lấy role từ identity và chuẩn hóa:

```text
" ADMIN " → "admin"
"Admin"   → "admin"
"USER"    → "user"
```

Nếu role không tồn tại hoặc không phải chuỗi, kết quả là `null`.

---

## 10. `requireAdmin()`

```php
protected function requireAdmin(): bool
{
    if ($this->getAuthenticatedUserRole() !== 'admin') {
        $this->renderJson([
            'status' => 'error',
            'message' => 'Bạn không có quyền truy cập chức năng admin',
        ], 403);

        return false;
    }

    return true;
}
```

Đây là kiểm tra phân quyền backend.

### 10.1. Admin hợp lệ

```text
role = admin
→ requireAdmin() trả true
→ action tiếp tục
```

### 10.2. User thường

```text
role = user
→ tạo response 403
→ requireAdmin() trả false
```

### 10.3. Cách gọi đúng

```php
if (!$this->requireAdmin()) {
    return;
}
```

Giải thích toán tử `!`:

| Giá trị `requireAdmin()` | Sau `!` | Hành động |
|---:|---:|---|
| `true` | `false` | Không vào `if`, tiếp tục action |
| `false` | `true` | Vào `if`, `return` dừng action |

### 10.4. Vì sao `return` bắt buộc?

`requireAdmin()` tạo response 403 nhưng không tự kết thúc method của controller con.

Sai:

```php
$this->requireAdmin();
$table->save($entity);
```

Đúng:

```php
if (!$this->requireAdmin()) {
    return;
}

$table->save($entity);
```

### 10.5. Ví dụ với bảng giá điện

```php
public function edit(int $id): void
{
    $this->request->allowMethod(['patch', 'put']);

    if (!$this->requireAdmin()) {
        return;
    }

    // Chỉ chạy khi người gọi là admin.
}
```

Luồng:

```text
Kiểm tra HTTP method
        ↓
Kiểm tra quyền admin
        ↓
Tìm entity
        ↓
Validation
        ↓
Lưu database
```

---

## 11. Xác thực và phân quyền khác nhau thế nào?

### Authentication — xác thực

Trả lời câu hỏi:

> Người gửi request là ai?

Ví dụ:

- JWT có hợp lệ không?
- API Key của ESP32 có tồn tại không?
- Identity hiện tại là user nào?

### Authorization — phân quyền

Trả lời câu hỏi:

> Người đó được phép làm gì?

Ví dụ:

- User có được sửa bảng giá không? Không.
- Admin có được disable bộ đo không? Có.
- User có được xem Device của người khác không? Không.

Trong dự án:

```text
Authentication Middleware / API Key
        ↓
Xác định danh tính
        ↓
requireAdmin() hoặc điều kiện user_id
        ↓
Quyết định quyền truy cập dữ liệu
```

---

## 12. `readIdentityValue()`

```php
protected function readIdentityValue(
    mixed $identity,
    string $field
): mixed
```

Identity có thể tồn tại dưới nhiều kiểu khác nhau. Method này đọc field một cách linh hoạt.

### 12.1. Identity là `null`

```php
if ($identity === null) {
    return null;
}
```

Nghĩa là request chưa có danh tính hợp lệ.

### 12.2. Identity là array

```php
if (
    is_array($identity)
    && array_key_exists($field, $identity)
) {
    return $identity[$field];
}
```

Ví dụ:

```php
$identity = [
    'id' => 5,
    'role' => 'admin',
];
```

### 12.3. Identity triển khai `ArrayAccess`

```php
if (
    $identity instanceof ArrayAccess
    && $identity->offsetExists($field)
) {
    return $identity[$field];
}
```

Object `ArrayAccess` có thể được truy cập giống array.

### 12.4. Identity là object có `get()`

```php
if (method_exists($identity, 'get')) {
    $value = $identity->get($field);
}
```

CakePHP Entity hỗ trợ:

```php
$user->get('id');
$user->get('role');
```

### 12.5. Identity có public property

```php
if (isset($identity->{$field})) {
    return $identity->{$field};
}
```

Ví dụ:

```php
$identity->id;
```

### 12.6. Identity wrapper

```php
if (method_exists($identity, 'getOriginalData')) {
    return $this->readIdentityValue(
        $identity->getOriginalData(),
        $field
    );
}
```

Authentication có thể bọc User Entity trong một identity object. Method lấy dữ liệu gốc rồi gọi lại chính nó.

Đây là đệ quy có điểm dừng: dữ liệu gốc cuối cùng là array/entity/object đọc được hoặc `null`.

---

## 13. Luồng request user thông thường

Ví dụ:

```http
GET /api/devices
Authorization: Bearer <user-token>
```

Luồng xử lý:

```text
React gửi request
        ↓
Authentication Middleware đọc JWT
        ↓
JWT hợp lệ → tạo identity
        ↓
DevicesController được khởi tạo
        ↓
AppController::initialize()
        ↓
getAuthenticatedUserId()
        ↓
Service lọc Devices.user_id
        ↓
renderJson()
        ↓
React nhận JSON
```

---

## 14. Luồng request admin

Ví dụ:

```http
PATCH /api/price-tiers/1
Authorization: Bearer <admin-token>
```

```text
JWT hợp lệ
        ↓
Identity có role = admin
        ↓
Controller gọi requireAdmin()
        ↓
true → tiếp tục cập nhật
        ↓
Validation và save
        ↓
JSON response
```

Nếu token thuộc user thường:

```text
Identity có role = user
        ↓
requireAdmin() trả false
        ↓
renderJson(..., 403)
        ↓
return dừng action
        ↓
Không thay đổi database
```

---

## 15. Luồng ESP32 gửi dữ liệu

```http
POST /api/energy-logs
IOT-KEY: <iot_key>
Content-Type: application/json

{
  "voltage": 220.5,
  "current": 0.8,
  "power": 176.4,
  "energy": 1.25
}
```

Luồng:

```text
ESP32 gửi POST /api/energy-logs
        ↓
AppController tắt identity check cho đúng endpoint
        ↓
EnergyLogsController đọc iot_key
        ↓
EnergyLogsService tìm iot_devices.iot_key
        ↓
Kiểm tra iot_devices.status = active
        ↓
Tìm Device active đang dùng bộ đo
        ↓
Lưu EnergyLog
        ↓
Cập nhật iot_devices.last_seen_at
        ↓
Tổng hợp dữ liệu, học ngưỡng và kiểm tra cảnh báo
```

---

## 16. Frontend guard và backend authorization

React có `ProtectedRoute requireAdmin` để điều hướng giao diện, nhưng đây không phải lớp bảo mật cuối cùng.

Người dùng có thể bỏ qua giao diện và gửi HTTP request bằng Postman hoặc script.

Vì vậy cần cả hai lớp:

| Lớp | Vai trò |
|---|---|
| React `ProtectedRoute` | Không hiển thị trang sai role, cải thiện trải nghiệm |
| CakePHP `requireAdmin()` | Bảo vệ API và database thật sự |

Nguyên tắc trình bày trước hội đồng:

> Phân quyền frontend chỉ là lớp điều hướng giao diện. Quyền truy cập dữ liệu được kiểm tra lại bắt buộc ở backend, vì client là môi trường không đáng tin cậy.

---

## 17. Tại sao helper là `protected`?

Các method dùng chung được khai báo:

```php
protected function renderJson(...)
protected function getAuthenticatedUserId(...)
protected function requireAdmin(...)
```

`protected` có nghĩa:

- `AppController` sử dụng được;
- controller con sử dụng được;
- code bên ngoài không gọi trực tiếp như một public action.

Nếu chúng là `public`, CakePHP router có nguy cơ xem chúng như action có thể định tuyến. Vì vậy `protected` phù hợp hơn.

---

## 18. Nguyên tắc đặt code vào `AppController`

Nên đặt:

- helper tạo response chung;
- đọc identity;
- kiểm tra role;
- cấu hình component dùng chung;
- cấu hình view dùng chung.

Không nên đặt:

- tạo Device;
- disable bộ đo;
- tính tổng điện năng;
- gửi cảnh báo;
- cập nhật bảng giá;
- truy vấn riêng cho một module.

Các nghiệp vụ phải nằm trong service/controller tương ứng để tuân thủ nguyên tắc trách nhiệm đơn nhất.

---

## 19. Câu hỏi hội đồng có thể đặt ra

### Câu 1: Vì sao cần `AppController`?

Trả lời:

> `AppController` tập trung các cấu hình và helper dùng chung như Authentication, JSON response và đọc identity. Các controller nghiệp vụ kế thừa nó để tránh lặp code và bảo đảm cách xử lý nhất quán.

### Câu 2: `ProtectedRoute` đã chặn user rồi, tại sao backend còn cần `requireAdmin()`?

Trả lời:

> Frontend có thể bị bỏ qua bằng Postman hoặc request thủ công. Backend là nơi bảo vệ database nên mọi API quản trị vẫn phải kiểm tra role admin.

### Câu 3: `401` và `403` khác nhau thế nào?

Trả lời:

> `401 Unauthorized` nghĩa là chưa xác thực hoặc thông tin xác thực không hợp lệ. `403 Forbidden` nghĩa là đã xác định được người gọi nhưng họ không có quyền thực hiện chức năng đó.

### Câu 4: Vì sao ESP32 không dùng JWT?

Trả lời:

> JWT đang đại diện cho phiên người dùng. ESP32 là thiết bị máy–máy và được nhận dạng bằng API Key riêng của bộ đo. Backend chỉ miễn identity user cho đúng endpoint nhận dữ liệu nhưng vẫn kiểm tra API Key và trạng thái bộ đo.

### Câu 5: Vì sao phải kiểm tra cả method và path khi miễn identity?

Trả lời:

> Để giới hạn ngoại lệ ở phạm vi nhỏ nhất. Chỉ request POST dùng để ghi dữ liệu IoT được miễn JWT; các request GET xem dữ liệu vẫn yêu cầu user đăng nhập.

### Câu 6: `renderJson()` có lợi ích gì?

Trả lời:

> Nó chuẩn hóa Content-Type, HTTP status và danh sách field serialize, giúp response giữa các controller thống nhất và frontend dễ xử lý.

### Câu 7: Vì sao dùng `return` sau `requireAdmin()`?

Trả lời:

> `requireAdmin()` tạo response lỗi và trả boolean nhưng không tự kết thúc action của controller con. `return` ngăn phần query hoặc cập nhật database phía dưới tiếp tục chạy.

### Câu 8: Vì sao `readIdentityValue()` phải hỗ trợ nhiều kiểu dữ liệu?

Trả lời:

> Identity có thể là array, CakePHP Entity hoặc wrapper của Authentication. Helper giúp controller không phụ thuộc vào một representation cụ thể.

### Câu 9: Vì sao helper dùng `protected` thay vì `public`?

Trả lời:

> Controller con vẫn dùng được nhưng router không coi chúng là action công khai. Điều này đúng với mục đích helper nội bộ.

### Câu 10: Online/offline có được xử lý trong `AppController` không?

Trả lời:

> Không. Đây là nghiệp vụ Device/IoT nên được tính từ `iot_devices.last_seen_at` trong service tương ứng. `AppController` chỉ xử lý concern dùng chung.

---

## 20. Những nhầm lẫn thường gặp

### Nhầm lẫn 1: `disableIdentityCheck()` làm endpoint công khai hoàn toàn

Không đúng. Nó chỉ bỏ yêu cầu identity user. API Key vẫn phải được kiểm tra.

### Nhầm lẫn 2: `renderJson(..., 403)` tự dừng action

Không đúng. Controller con vẫn cần `return`.

### Nhầm lẫn 3: Role ở localStorage là đủ để bảo mật

Không đúng. LocalStorage thuộc client và có thể bị chỉnh sửa. Backend phải dựa trên identity từ token đã xác minh.

### Nhầm lẫn 4: `401` dùng cho mọi lỗi quyền

Không đúng. User đã đăng nhập nhưng không phải admin phải nhận `403`.

### Nhầm lẫn 5: `AppController` nên chứa mọi code dùng nhiều lần

Không đúng. Chỉ concern thuộc controller và dùng chung mới nên đặt ở đây. Nghiệp vụ phải đặt trong service phù hợp.

---

## 21. Checklist tự học

Trước khi bảo vệ, cần tự trả lời được:

- [ ] `AppController` kế thừa class nào?
- [ ] Controller API kế thừa `AppController` để làm gì?
- [ ] `initialize()` được gọi khi nào?
- [ ] Identity đến từ đâu?
- [ ] JWT được gửi trong header nào?
- [ ] Vì sao ESP32 được miễn identity user?
- [ ] ESP32 được xác thực lại bằng gì?
- [ ] `renderJson()` thực hiện ba việc nào?
- [ ] `success()` và `error()` khác nhau thế nào?
- [ ] `id` và `sub` trong identity có ý nghĩa gì?
- [ ] Authentication khác Authorization thế nào?
- [ ] Vì sao `requireAdmin()` trả boolean?
- [ ] Vì sao controller con phải `return`?
- [ ] `ProtectedRoute` có thay thế được backend permission không?
- [ ] Khi nào dùng 401, 403, 404 và 422?

---

## 22. Phần trình bày ngắn trước hội đồng

Có thể trình bày trong khoảng một phút:

> Trong backend CakePHP, `AppController` là controller cha dùng để tập trung các concern chung. Method `initialize()` nạp Authentication component và cấu hình JSON view. User React được xác thực bằng JWT, còn ESP32 sử dụng API Key nên chỉ endpoint POST nhận EnergyLog được miễn identity user. Các helper `renderJson`, `success` và `error` chuẩn hóa response. `getAuthenticatedUserId` và `getAuthenticatedUserRole` đọc thông tin từ identity. Những API quản trị gọi `requireAdmin()` và dừng action nếu role không phải admin. Frontend guard chỉ hỗ trợ điều hướng, còn quyền truy cập database luôn được kiểm tra lại tại backend.

---

## 23. Kết luận

`AppController` là lớp nền của tầng controller, không phải nơi xử lý nghiệp vụ cụ thể. Nó giúp dự án:

- thống nhất JSON response;
- tái sử dụng logic đọc identity;
- phân quyền admin ở backend;
- phân biệt xác thực user và thiết bị IoT;
- giảm lặp code giữa các controller;
- giữ kiến trúc dễ giải thích và bảo trì.

Khi trình bày, cần nhấn mạnh nguyên tắc:

```text
Frontend điều hướng giao diện.
Backend kiểm soát quyền truy cập thật.
Service xử lý nghiệp vụ.
Database bảo đảm tính toàn vẹn dữ liệu.
```
