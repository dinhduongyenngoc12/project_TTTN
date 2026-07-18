# Tài liệu học validation trong dự án IoT Energy

## 1. Mục tiêu tài liệu

Tài liệu này giải thích toàn bộ các lớp kiểm tra dữ liệu đang có trong dự án IoT Energy, từ lúc người dùng nhập dữ liệu trên React đến khi dữ liệu được MySQL chấp nhận hoặc từ chối.

Sau khi học xong, cần trả lời được các câu hỏi:

- Validation là gì và khác chuẩn hóa dữ liệu như thế nào?
- Frontend validation có bảo mật API không?
- TypeScript có kiểm tra dữ liệu lúc runtime không?
- `newEntity()` và `patchEntity()` liên quan gì đến validation?
- `validationDefault()` khác `buildRules()` như thế nào?
- `$_accessible` trong Entity có phải validator không?
- Vì sao dữ liệu đã qua frontend vẫn phải kiểm tra lại ở backend?
- MySQL đóng vai trò gì nếu backend đã có validator?
- Dự án hiện tại đang đúng ở đâu và còn điểm nào chưa đồng bộ?

---

## 2. Cách ghi nhớ nhanh: 10 lớp bảo vệ

Ghi nhớ chuỗi sau:

> **Nhập – Kiểu – Form – Tuyến – Quyền – Lọc – Nghiệp vụ – Entity – ORM – DB**

Tương ứng với 10 lớp:

| STT | Lớp | Công nghệ trong dự án | Vai trò chính |
|---:|---|---|---|
| 1 | Điều khiển nhập liệu | HTML input/select | Hạn chế dữ liệu nhập sai trên giao diện |
| 2 | Kiểu lúc lập trình | TypeScript | Phát hiện lỗi khi viết và build frontend |
| 3 | Form runtime | Zod hoặc kiểm tra thủ công | Kiểm tra giá trị thực khi submit |
| 4 | Tuyến và HTTP method | CakePHP routes, `allowMethod()` | Chặn sai endpoint hoặc sai method |
| 5 | Xác thực và phân quyền | Authentication, `requireAdmin()` | Xác định ai được gọi nghiệp vụ |
| 6 | Lọc và chuẩn hóa payload | Controller | Chỉ lấy field cho phép, trim và chuyển kiểu |
| 7 | Quy tắc nghiệp vụ | Service | Kiểm tra điều kiện phụ thuộc trạng thái hệ thống |
| 8 | Mass assignment | Entity `$_accessible` | Quyết định field nào được gán hàng loạt |
| 9 | ORM validation và rules | `validationDefault()`, `buildRules()` | Kiểm tra field và tính toàn vẹn dữ liệu |
| 10 | Ràng buộc cuối | MySQL schema | Chặn dữ liệu vi phạm schema khi ghi DB |

Không phải request nào cũng sử dụng đủ cả 10 lớp, nhưng backend và DB không được phụ thuộc vào frontend.

---

## 3. Luồng validation tổng quát

```text
Người dùng nhập dữ liệu
        ↓
HTML input: required, min, max, type
        ↓
TypeScript: kiểm tra kiểu khi viết/build code
        ↓
Zod hoặc hàm kiểm tra form lúc runtime
        ↓
HTTP request
        ↓
Route + allowMethod()
        ↓
Authentication + Authorization
        ↓
Controller lọc và chuẩn hóa payload
        ↓
Service kiểm tra nghiệp vụ
        ↓
newEntity()/patchEntity()
        ↓
validationDefault()
        ↓
Entity có dữ liệu hoặc có errors
        ↓
save()
        ↓
buildRules()
        ↓
MySQL constraints
```

Điểm quan trọng nhất:

> Frontend giúp người dùng nhập đúng; backend và database bắt buộc dữ liệu phải đúng.

---

## 4. Ba khái niệm dễ nhầm

### 4.1. Validation

Validation trả lời câu hỏi:

> Giá trị này có hợp lệ không?

Ví dụ:

- Tên thiết bị có rỗng không?
- Email có đúng định dạng không?
- Công suất có phải số và lớn hơn hoặc bằng 0 không?
- Status có thuộc danh sách cho phép không?

### 4.2. Normalization

Normalization trả lời câu hỏi:

> Chuyển dữ liệu về dạng thống nhất như thế nào?

Ví dụ:

```php
$name = trim((string)($requestData['name'] ?? ''));
```

Đoạn trên:

- Lấy `name`, nếu thiếu thì dùng chuỗi rỗng.
- Ép thành string.
- Xóa khoảng trắng đầu và cuối.

Nó chưa kết luận tên hợp lệ. Validator mới kiểm tra chuỗi sau chuẩn hóa.

### 4.3. Sanitization hoặc whitelist payload

Whitelist trả lời câu hỏi:

> Request được phép tác động đến những field nào?

Ví dụ khi sửa thiết bị, backend chỉ tạo payload:

```php
$data = [
    'name' => trim((string)($requestData['name'] ?? '')),
    'device_type' => trim((string)($requestData['device_type'] ?? '')),
    'rated_power' => $requestData['rated_power'] ?? null,
];
```

Nếu client gửi thêm `status`, `iot_device_id` hoặc `activated_at`, các field đó không xuất hiện trong `$data` và không được xử lý.

---

## 5. Lớp 1 – HTML input validation

Form thiết bị đang dùng các thuộc tính HTML:

```tsx
<input type="text" required maxLength={100} />
```

```tsx
<input type="number" min="0" step="0.01" />
```

Ý nghĩa:

| Thuộc tính | Tác dụng |
|---|---|
| `required` | Không cho submit form nếu bỏ trống |
| `type="number"` | Hiển thị input số và kiểm tra định dạng cơ bản |
| `min="0"` | Không chấp nhận giá trị nhỏ hơn 0 trên form |
| `step="0.01"` | Cho phép bước số thập phân 0.01 |
| `maxLength={100}` | Giới hạn chiều dài chuỗi trên giao diện |

Giới hạn:

- Có thể bị bỏ qua bằng Postman hoặc DevTools.
- Không bảo vệ API.
- Không kiểm tra quan hệ database.
- Không được xem là lớp bảo mật.

---

## 6. Lớp 2 – TypeScript

Ví dụ payload:

```ts
type CreateDevicePayload = {
    api_key: string;
    name: string;
    device_type: string;
    rated_power: number | null;
};
```

TypeScript giúp phát hiện lỗi như:

```ts
const payload: CreateDevicePayload = {
    api_key: 123, // lỗi lúc build vì cần string
};
```

Nhưng TypeScript bị loại bỏ sau khi build. Nó không tồn tại để kiểm tra JSON nhận từ mạng lúc runtime.

Câu cần nhớ:

> TypeScript kiểm tra code của lập trình viên, không xác thực người gọi API.

---

## 7. Lớp 3 – Validation frontend lúc runtime

### 7.1. Zod trong form đăng ký

`registerSchema` kiểm tra:

- `username`: string, trim, từ 2 đến 50 ký tự, chỉ gồm chữ, số và `_`.
- `email`: đúng định dạng email, tối đa 255 ký tự.
- `password`: đúng 8 chữ số, không thuộc danh sách mật khẩu yếu, không phải một chữ số lặp lại.

Zod thực sự chạy khi form submit nên mạnh hơn TypeScript trong việc kiểm tra dữ liệu runtime.

### 7.2. Kiểm tra thủ công trong trang thiết bị

Flow thiết bị chưa dùng Zod mà kiểm tra bằng `if`:

```ts
if (!formData.name.trim()) {
    setError("Vui lòng nhập tên thiết bị.");
    return;
}
```

```ts
if (
    formData.rated_power !== null &&
    Number(formData.rated_power) < 0
) {
    setError("Công suất định mức không được nhỏ hơn 0.");
    return;
}
```

Cả Zod và kiểm tra thủ công đều phục vụ trải nghiệm người dùng. Backend vẫn phải kiểm tra lại.

---

## 8. Lớp 4 – Route và HTTP method

Route xác định endpoint nào tồn tại và action nào xử lý request.

Trong Controller:

```php
$this->request->allowMethod(['post']);
```

Hoặc:

```php
$this->request->allowMethod(['patch', 'put']);
```

`allowMethod()` không kiểm tra nội dung field. Nó kiểm tra request có dùng đúng phương thức HTTP hay không.

Ví dụ:

| Nghiệp vụ | Method hợp lệ |
|---|---|
| Xem danh sách | GET |
| Tạo mới | POST |
| Cập nhật | PATCH hoặc PUT |
| Xóa | DELETE |

Nếu action chỉ cho POST mà client gửi GET, CakePHP từ chối trước khi chạy phần lưu dữ liệu.

---

## 9. Lớp 5 – Authentication và Authorization

### 9.1. Authentication

Authentication trả lời:

> Người gọi là ai?

JWT identity được lấy từ request hoặc Authentication component.

### 9.2. Authorization

Authorization trả lời:

> Người đó có được thực hiện hành động này không?

Ví dụ:

```php
if (!$this->requireAdmin()) {
    return;
}
```

`requireAdmin()` không kiểm tra kiểu `price_kwh`. Nó chỉ chặn người không có role admin trước khi chạy nghiệp vụ quản trị.

### 9.3. API Key của ESP32

`POST /api/energy-logs` không dùng JWT user. Service kiểm tra:

1. Header có API Key hay không.
2. API Key có tồn tại trong `iot_devices` không.
3. Bộ đo có status `active` không.
4. Bộ đo có liên kết với một device `active` không.

Đây là xác thực thiết bị và kiểm tra nghiệp vụ, không phải field validation đơn thuần.

---

## 10. Lớp 6 – Controller lọc và chuẩn hóa payload

Controller thiết bị là ví dụ tốt vì không patch toàn bộ request.

### Khi thêm thiết bị

Backend chỉ lấy:

- `user_id` từ identity, không lấy từ client.
- `name`.
- `device_type`.
- `rated_power`.
- `api_key`.

### Khi sửa thiết bị

Backend chỉ lấy:

- `name`.
- `device_type`.
- `rated_power`.

Do đó client không thể sửa qua API này:

- `api_key`.
- `iot_device_id`.
- `status`.
- `activated_at`.
- `created_at`.

Nguyên tắc dễ nhớ:

> Không đưa nguyên request vào entity nếu endpoint chỉ được phép sửa một số field.

---

## 11. Lớp 7 – Service validation theo nghiệp vụ

Table Validator chỉ kiểm tra từng field. Service kiểm tra điều kiện phụ thuộc nhiều bảng và trạng thái hệ thống.

### 11.1. Thêm thiết bị

`DevicesService` kiểm tra:

- API Key tồn tại.
- `iot_devices.status` phải là `active`.
- Khóa record trong transaction để tránh hai request đồng thời.
- Device cũ dùng cùng bộ đo được chuyển sang `inactive`.
- Device mới được gán `active`.
- Tạo alert config mặc định.

### 11.2. Dữ liệu điện năng

`EnergyLogsService` chuyển dữ liệu cảm biến thành `float|null` rồi xác định:

```php
$isValid = $voltage !== null
    && $voltage > 80
    && $voltage <= 300
    && $current !== null
    && $current >= 0
    && $power !== null
    && $power >= 0
    && $energy !== null
    && $energy >= 0;
```

Dữ liệu sai vẫn được lưu với `is_valid = 0` để truy vết, nhưng không được dùng để:

- Tổng hợp theo giờ/ngày/tháng.
- Học ngưỡng.
- Tạo cảnh báo.

Đây là quy tắc nghiệp vụ, không phải lỗi thiếu validator.

---

## 12. Lớp 8 – Entity và mass assignment

### 12.1. `$_accessible`

```php
protected array $_accessible = [
    'name' => true,
    'rated_power' => true,
];
```

Nó quyết định field có được gán qua `newEntity()` hoặc `patchEntity()` hay không.

Nó không kiểm tra:

- Field có đúng kiểu không.
- Chuỗi có rỗng không.
- Số có âm không.
- Foreign key có tồn tại không.

### 12.2. PHPDoc của Entity

```php
/** @property float|null $power */
```

PHPDoc hỗ trợ IDE và static analysis. Nó không phải runtime validation.

### 12.3. `$_hidden`

```php
protected array $_hidden = ['password'];
```

`$_hidden` ngăn password xuất hiện khi Entity được chuyển thành JSON. Nó không kiểm tra password đầu vào.

Cách nhớ:

| Thành phần Entity | Vai trò |
|---|---|
| PHPDoc | Mô tả kiểu cho IDE |
| `$_accessible` | Quyền mass assignment |
| `$_hidden` | Ẩn field khi serialize |
| Setter `_setPassword()` | Biến đổi dữ liệu, ví dụ hash password |

---

## 13. Lớp 9A – `validationDefault()`

Validation mặc định thường chạy khi dữ liệu được marshal qua `newEntity()` hoặc `patchEntity()`.

Nếu sai, lỗi nằm trong:

```php
$entity->getErrors();
```

### Các rule đang được dùng trong dự án

| Rule | Ý nghĩa |
|---|---|
| `scalar()` | Không chấp nhận array/object; nhận giá trị vô hướng |
| `integer()` | Giá trị phải biểu diễn số nguyên hợp lệ |
| `numeric()` | Giá trị phải biểu diễn một số hợp lệ |
| `decimal()` | Giá trị thập phân hợp lệ |
| `boolean()` | Giá trị boolean hợp lệ |
| `date()` | Ngày hợp lệ |
| `dateTime()` | Ngày giờ hợp lệ |
| `email()` | Email đúng định dạng |
| `requirePresence()` | Field phải có trong payload ở ngữ cảnh chỉ định |
| `notEmptyString()` | Không được là chuỗi rỗng |
| `allowEmptyString()` | Cho phép chuỗi rỗng hoặc giá trị trống phù hợp |
| `notEmptyDate()` | Ngày không được để trống |
| `allowEmptyDateTime()` | Cho phép ngày giờ trống |
| `minLength()` | Độ dài tối thiểu |
| `maxLength()` | Độ dài tối đa |
| `inList()` | Chỉ nhận giá trị trong danh sách |
| `greaterThan()` | Phải lớn hơn mốc |
| `greaterThanOrEqual()` | Phải lớn hơn hoặc bằng mốc |
| `add(...custom...)` | Rule tùy chỉnh, ví dụ regex hoặc callback |

### `requirePresence()` không giống `notEmptyString()`

Payload không có field:

```json
{}
```

được kiểm tra bởi `requirePresence()`.

Payload có field nhưng rỗng:

```json
{ "name": "" }
```

được kiểm tra bởi `notEmptyString()`.

Vì vậy field bắt buộc thường cần cả hai.

### Ngữ cảnh create và update

```php
->requirePresence('name', 'create')
```

nghĩa là `name` bắt buộc phải xuất hiện khi tạo mới. Khi update một phần, không nhất thiết mọi field đều phải xuất hiện.

---

## 14. Lớp 9B – `buildRules()`

`buildRules()` kiểm tra tính toàn vẹn ở cấp ứng dụng khi `save()`.

### `existsIn()`

```php
$rules->add(
    $rules->existsIn(['device_id'], 'Devices'),
    ['errorField' => 'device_id']
);
```

`integer('device_id')` chỉ xác nhận `device_id` là số nguyên. `existsIn()` mới xác nhận device thực sự tồn tại.

### `isUnique()`

```php
$rules->add(
    $rules->isUnique(['username']),
    ['errorField' => 'username']
);
```

Nó kiểm tra không tồn tại record khác có cùng giá trị.

### Phân biệt Validator và RulesChecker

| Câu hỏi | Thành phần trả lời |
|---|---|
| Giá trị có đúng kiểu không? | Validator |
| Field có rỗng không? | Validator |
| Status có thuộc enum nghiệp vụ không? | Validator |
| Foreign key có record tương ứng không? | RulesChecker |
| Username đã tồn tại chưa? | RulesChecker |
| Hai field kết hợp có bị trùng không? | RulesChecker |

---

## 15. Lớp 10 – MySQL schema

MySQL là lớp cuối cùng trước khi dữ liệu được lưu.

Các ràng buộc chính:

| Ràng buộc | Ví dụ | Tác dụng |
|---|---|---|
| Kiểu cột | `int`, `float`, `varchar`, `datetime` | Giới hạn dạng dữ liệu lưu trữ |
| Độ dài | `varchar(100)` | Giới hạn chiều dài |
| `NOT NULL` | `device_id int NOT NULL` | Không cho null |
| `DEFAULT` | status mặc định `active` | Giá trị mặc định |
| `ENUM` | `active`, `inactive` | Giới hạn miền giá trị ở DB |
| Foreign key | `energy_logs.device_id` | Bảo vệ quan hệ |
| Unique | tổ hợp field duy nhất | Chống trùng dữ liệu |

Backend validator và DB schema nên đồng bộ. DB không thay thế thông báo lỗi thân thiện của backend; backend không thay thế tính toàn vẹn cuối cùng của DB.

---

## 16. Validation theo từng Table trong dự án

### 16.1. `UsersTable`

Kiểm tra:

- Username: scalar, bắt buộc, không rỗng, 2–50 ký tự, regex chữ/số/`_`.
- Email: scalar, bắt buộc, không rỗng, đúng email, tối đa 255 ký tự.
- Password: scalar, bắt buộc, đúng 8 ký tự số, không quá yếu.
- Role: scalar, tối đa 10 ký tự, hiện cho phép rỗng.
- Rules: username và email duy nhất.

Điểm cần sửa: role chưa có `inList(['user', 'admin'])` và flow register đang cho phép mass assign role.

### 16.2. `UserSocialAccountsTable`

Kiểm tra:

- `user_id` là integer và bắt buộc.
- Provider và provider user ID bắt buộc, giới hạn độ dài.
- Email provider và avatar có thể rỗng.
- Rules: user tồn tại; cặp provider/provider user ID duy nhất; mỗi user chỉ có một social account theo rule hiện tại.

### 16.3. `UserOtpsTable`

Kiểm tra:

- Email bắt buộc, tối đa 100.
- OTP bắt buộc, tối đa 6 ký tự.
- `created_at` và `expires_at` là datetime bắt buộc.

Lưu ý: Table hiện giới hạn tối đa 6 nhưng chưa có rule bắt buộc đúng 6 chữ số. OTP do backend sinh nên rủi ro đầu vào thấp hơn, nhưng validation vẫn chưa mô tả đầy đủ định dạng.

### 16.4. `RefreshTokensTable`

Kiểm tra:

- `user_id` là integer.
- Token bắt buộc, tối đa 512, có rule duy nhất.
- Ngày hết hạn bắt buộc.
- User phải tồn tại.

### 16.5. `PasswordResetTokensTable`

Kiểm tra:

- `user_id` bắt buộc và phải tồn tại.
- `token_hash` bắt buộc, tối đa 64, duy nhất.
- `expires_at` và `created_at` bắt buộc.
- `used_at` có thể rỗng.

### 16.6. `IotDevicesTable`

Kiểm tra:

- API Key bắt buộc khi tạo, tối đa 100.
- Status bắt buộc và chỉ nhận `active` hoặc `disabled`.

Đây là enum đúng với nghiệp vụ bộ đo IoT.

### 16.7. `DevicesTable`

Kiểm tra:

- `user_id`, `iot_device_id`: integer theo nullable tương ứng.
- Tên: bắt buộc khi tạo, không rỗng, tối đa 100.
- Loại: bắt buộc khi tạo, không rỗng, tối đa 50.
- Công suất định mức: numeric, không âm, hiện có thể rỗng.
- Status: `active` hoặc `inactive`.
- Các thời điểm: datetime hoặc có thể rỗng.
- Rules: user và IoT device phải tồn tại.

### 16.8. `EnergyLogsTable`

Kiểm tra:

- `device_id` là integer, bắt buộc khi tạo và phải tồn tại.
- Power, voltage, current, energy là numeric nhưng có thể rỗng.
- `is_valid` là boolean và không rỗng.
- `created_at` là datetime và không rỗng.

Việc các thông số cho phép null phù hợp flow lưu bản đo lỗi để truy vết.

### 16.9. `AlertConfigsTable`

Kiểm tra:

- `device_id` bắt buộc, phải tồn tại và duy nhất.
- Threshold là numeric và có thể rỗng.
- Mode chỉ nhận `auto` hoặc `manual`.
- Learning status chỉ nhận `learning`, `learned_3d`, `learned_7d`, `adaptive`.
- Các thời điểm học/gửi email có thể rỗng.

### 16.10. `AlertLogsTable`

Kiểm tra:

- Alert config ID bắt buộc và phải tồn tại.
- Energy log ID phải tồn tại nếu có.
- Power và threshold value bắt buộc, numeric.
- Email sent là boolean.
- Energy log ID duy nhất, nhưng cho phép nhiều null theo rule hiện tại.

### 16.11. `HourSummariesTable`

Kiểm tra:

- Device ID bắt buộc và phải tồn tại.
- `hour_at` là datetime bắt buộc.
- Total energy, average power, max power là numeric và có thể rỗng.
- Tổ hợp device/hour là duy nhất.

### 16.12. `DailySummariesTable`

Kiểm tra:

- Device ID bắt buộc và phải tồn tại.
- `date_at` là date bắt buộc.
- Các giá trị năng lượng/công suất là numeric.
- Alert count là integer.
- Tổ hợp device/date là duy nhất.

### 16.13. `MonthSummariesTable`

Kiểm tra:

- Device ID, year, month là integer và bắt buộc.
- Total energy và estimated cost là numeric.
- Note là scalar và có thể rỗng.
- Tổ hợp device/year/month là duy nhất.

Điểm cần lưu ý: Table hiện chưa giới hạn `month` trong khoảng 1–12.

### 16.14. `ElectricityPriceTiersTable`

Kiểm tra:

- Thứ tự bậc là integer và từ 1 trở lên.
- `from_kwh` là decimal và từ 0 trở lên.
- `to_kwh` là decimal, có thể rỗng và từ 0 trở lên.
- `price_kwh` là decimal và lớn hơn 0.
- Ngày áp dụng bắt buộc.
- Tổ hợp ngày áp dụng/thứ tự bậc là duy nhất.

Điểm cần lưu ý: hiện chưa có rule so sánh `to_kwh >= from_kwh` và chưa kiểm tra khoảng bậc có chồng lấn hay không.

### 16.15. `utility_notes`

Schema dump có bảng `utility_notes`, nhưng source hiện chưa có Table/Entity/API tương ứng. Vì vậy chưa có application validation cho module này. Đây là module chưa triển khai, không nên trình bày như chức năng đã hoàn thiện.

---

## 17. Hai flow mẫu cần thuộc

### 17.1. Đăng ký tài khoản

```text
React form
  → Zod kiểm tra username/email/password
  → POST register
  → Controller patch request vào User entity
  → UsersTable validationDefault
  → Entity hash password bằng setter
  → buildRules kiểm tra username/email trùng
  → MySQL ghi user
```

Điểm chưa an toàn hiện tại:

- Controller patch nguyên request.
- `User::$_accessible` cho phép `id` và `role`.
- Validator role không giới hạn `user/admin`.
- DB role là `NOT NULL` nhưng không có default trong schema dump.

Flow đúng về nguyên tắc phải là:

```text
Client chỉ gửi username/email/password
  → Controller whitelist ba field
  → Backend tự gán role = user
  → Không nhận role từ request đăng ký
```

### 17.2. Thêm thiết bị

```text
Form required/min/max
  → DevicePage trim và kiểm tra
  → POST /api/devices
  → Controller lấy user_id từ JWT
  → Controller whitelist payload
  → Service kiểm tra API Key và trạng thái bộ đo
  → Transaction + lock bộ đo
  → Device cũ chuyển inactive
  → patchEntity chạy DevicesTable validator
  → save chạy RulesChecker
  → tạo alert config mặc định
  → commit transaction
```

Đây là ví dụ kết hợp đầy đủ validation field, phân quyền, nghiệp vụ và tính toàn vẹn dữ liệu.

---

## 18. Các điểm chưa đồng bộ cần ghi nhớ

Đây là hiện trạng code, không phải tất cả đều đã được sửa.

| Mức độ | Điểm chưa đồng bộ | Hậu quả |
|---|---|---|
| Critical | Register patch toàn request; Entity cho mass assign `role` | Client có thể thử tự gửi role admin |
| High | DB `users.role` NOT NULL không default, FE không gửi role | Có thể lỗi insert nếu backend không tự gán role |
| High | `role` chưa có `inList(['user','admin'])` | Backend nhận chuỗi role ngoài miền nghiệp vụ |
| Medium | Nghiệp vụ từng chốt yêu cầu `rated_power`, nhưng FE/BE/DB đang cho null | Flow và đặc tả chưa thống nhất |
| Medium | DB cho `devices.name` null, BE bắt buộc khi tạo | DB yếu hơn application validation |
| Medium | Giá điện chưa kiểm tra `to_kwh >= from_kwh` và chồng lấn khoảng | Có thể tạo bảng giá logic sai |
| Medium | Month summary chưa giới hạn tháng 1–12 | Có thể nhận tháng không hợp lệ nếu service gửi sai |
| Low | OTP chỉ giới hạn tối đa 6, chưa bắt buộc đúng 6 chữ số tại Table | Validator chưa mô tả đầy đủ format OTP |
| Low | `EnergyLog` Entity có `recorded_at` accessible nhưng schema dump không có cột này | Field không đồng bộ giữa Entity và DB |
| Low | Query ngày của energy log mới chuẩn hóa chuỗi, chưa validate chặt định dạng | Input ngày sai có thể cho kết quả không mong muốn |

---

## 19. HTTP status khi validation thất bại

Quy ước nên nhớ:

| Status | Ý nghĩa |
|---:|---|
| 400 | Request thiếu hoặc sai cấu trúc cơ bản |
| 401 | Chưa xác thực hoặc API Key không hợp lệ |
| 403 | Đã xác thực nhưng không có quyền, hoặc bộ đo bị disable |
| 404 | Không tìm thấy resource |
| 409 | Xung đột dữ liệu, ví dụ record trùng |
| 422 | Payload đọc được nhưng vi phạm validation/nghiệp vụ |
| 500 | Lỗi nội bộ khi xử lý hoặc lưu dữ liệu |

Response validation nên có cấu trúc ổn định:

```json
{
  "status": "error",
  "message": "Không thể tạo thiết bị",
  "errors": {
    "name": {
      "_empty": "Tên thiết bị không được để trống"
    }
  }
}
```

---

## 20. Những câu trả lời không nên dùng

### Sai: “TypeScript đã khóa kiểu nên request luôn đúng”

Đúng phải là:

> TypeScript chỉ kiểm tra code frontend lúc phát triển; backend vẫn phải validate request runtime.

### Sai: “Input có required nên không thể gửi rỗng”

Đúng phải là:

> `required` chỉ hỗ trợ form trình duyệt và có thể bị bỏ qua khi gọi API trực tiếp.

### Sai: “Entity khai báo float nên PHP tự từ chối string”

Đúng phải là:

> PHPDoc trong Entity không phải runtime validation. Table Validator và ORM schema type mới xử lý dữ liệu runtime.

### Sai: “Validator đã kiểm tra foreign key”

Đúng phải là:

> Validator kiểm tra định dạng ID; `RulesChecker::existsIn()` và foreign key MySQL kiểm tra record liên quan có tồn tại.

### Sai: “Frontend và backend phải copy giống hệt mọi rule”

Đúng phải là:

> Các rule liên quan trải nghiệm có thể lặp ở FE, nhưng backend là nguồn sự thật. Rule bảo mật và nghiệp vụ bắt buộc nằm ở backend.

---

## 21. Bộ câu hỏi hội đồng và trả lời mẫu

### Câu 1: Dự án kiểm tra input ở đâu?

> Dự án kiểm tra ở frontend bằng HTML, TypeScript, Zod hoặc hàm thủ công; backend kiểm tra bằng Controller whitelist, Service nghiệp vụ, CakePHP Validator và RulesChecker; MySQL là lớp ràng buộc cuối cùng.

### Câu 2: Tại sao phải validate cả frontend và backend?

> Frontend giúp phản hồi nhanh và cải thiện trải nghiệm. Backend bắt buộc phải kiểm tra vì client không đáng tin cậy và API có thể bị gọi trực tiếp.

### Câu 3: `patchEntity()` có tác dụng gì?

> Nó marshal dữ liệu vào Entity, tôn trọng `$_accessible`, áp dụng type conversion của ORM và mặc định chạy validator được cấu hình. Lỗi được gắn vào Entity và đọc bằng `getErrors()`.

### Câu 4: `validationDefault()` và `buildRules()` khác gì nhau?

> `validationDefault()` kiểm tra giá trị từng field như kiểu, rỗng, độ dài và enum. `buildRules()` kiểm tra tính toàn vẹn liên quan dữ liệu đã tồn tại như foreign key và unique.

### Câu 5: `$_accessible` có phải validation không?

> Không. Nó kiểm soát mass assignment, tức field nào được phép gán hàng loạt. Nó không kiểm tra kiểu hoặc giá trị của field.

### Câu 6: Vì sao Energy Log sai vẫn được lưu?

> Đây là dữ liệu cảm biến. Bản đo sai được lưu với `is_valid = 0` để truy vết thiết bị, nhưng không được dùng cho tổng hợp, học ngưỡng hoặc cảnh báo.

### Câu 7: Làm sao ngăn user sửa status thiết bị?

> Frontend không hiển thị field đó, Controller edit chỉ whitelist name, device type và rated power, Service tiếp tục loại các field bị cấm. Status do backend quản lý theo nghiệp vụ liên kết bộ đo.

### Câu 8: Nếu backend validator và DB khác nhau thì sao?

> Có thể xuất hiện hai loại lỗi: backend chấp nhận nhưng DB từ chối, hoặc DB chấp nhận dữ liệu mà code nghiệp vụ xem là sai. Vì vậy schema và Table validation phải được audit đồng bộ.

### Câu 9: Rule nào bảo vệ enum status?

> CakePHP dùng `inList()` ở Table; MySQL có thể dùng ENUM. Trong dự án, devices chỉ nhận active/inactive và iot_devices chỉ nhận active/disabled.

### Câu 10: Validation có chống SQL injection không?

> Validation không phải cơ chế chính chống SQL injection. CakePHP Query Builder và parameter binding xử lý vấn đề đó. Validation đảm bảo dữ liệu đúng định dạng và nghiệp vụ.

---

## 22. Checklist tự kiểm tra một endpoint mới

Trước khi hoàn thành endpoint create/update, kiểm tra:

- [ ] Route có đúng controller/action không?
- [ ] Action có `allowMethod()` đúng không?
- [ ] Endpoint có cần đăng nhập không?
- [ ] Có cần role admin không?
- [ ] Controller có whitelist payload không?
- [ ] ID chủ sở hữu có lấy từ JWT thay vì request không?
- [ ] Chuỗi có được trim không?
- [ ] Số có được kiểm tra null/NaN/âm không?
- [ ] Table có `requirePresence()` cho create không?
- [ ] Có `notEmpty...()` cho field bắt buộc không?
- [ ] Độ dài có khớp `varchar(N)` không?
- [ ] Enum có `inList()` không?
- [ ] Foreign key có `existsIn()` không?
- [ ] Unique nghiệp vụ có RulesChecker và DB constraint không?
- [ ] Entity có chặn field nhạy cảm không?
- [ ] Service có kiểm tra điều kiện nghiệp vụ liên bảng không?
- [ ] Lỗi có trả status và `errors` phù hợp không?
- [ ] FE type/payload có khớp API không?
- [ ] FE validation có khớp các rule cần thông báo sớm không?
- [ ] Đã thử request sai bằng Postman chưa?

---

## 23. Bài trình bày một phút

> Trong dự án IoT Energy, em không phụ thuộc vào một lớp validation duy nhất. Ở frontend, HTML input, TypeScript và Zod hoặc kiểm tra thủ công giúp người dùng nhập đúng dữ liệu. Khi request đến backend, CakePHP kiểm tra HTTP method, xác thực người gọi và phân quyền. Controller chỉ lấy các field được phép và chuẩn hóa chúng. Service kiểm tra các quy tắc nghiệp vụ như API Key, trạng thái bộ đo và quyền sở hữu thiết bị. Dữ liệu sau đó được đưa qua Entity, `validationDefault()` và `buildRules()` trước khi MySQL kiểm tra schema và foreign key. Frontend validation phục vụ trải nghiệm; backend và database mới là lớp bảo vệ bắt buộc.

---

## 24. Tóm tắt cuối cùng

Ba câu quan trọng nhất cần thuộc:

1. **TypeScript và HTML validation không bảo vệ API.**
2. **`validationDefault()` kiểm tra field; `buildRules()` kiểm tra tính toàn vẹn dữ liệu.**
3. **Controller whitelist và Service nghiệp vụ cần tồn tại trước khi dữ liệu đến database.**

Công thức ghi nhớ:

```text
FE giúp nhập đúng
BE bắt buộc phải đúng
DB bảo đảm lưu đúng
```
