# Quy trình tạo Schema Dump cho hệ thống IoT Energy

## 1. Mục đích

Dự án hiện không sử dụng CakePHP migrations. Các thay đổi cấu trúc database được thực hiện trực tiếp trên MySQL.

Schema dump được duy trì nhằm:

- lưu cấu trúc database trong Git;
- tái tạo database trên máy khác;
- đối chiếu database với CakePHP và React/TypeScript;
- theo dõi thay đổi schema qua Git diff;
- kiểm tra bảng, cột, index và khóa ngoại;
- tránh phụ thuộc duy nhất vào database local.

File schema chính thức:

```text
config/schema/iot_energy_schema.sql
```

Schema dump chỉ chứa cấu trúc, không chứa dữ liệu.

## 2. Thông số môi trường đã xác minh

| Thông số | Giá trị |
|---|---|
| Hệ điều hành | Windows |
| Môi trường | WAMP |
| MySQL Server | 9.1.0 |
| MySQL client | 9.1.0 |
| Database | `iot_energy` |
| Host | `localhost` |
| Port | `3306` |
| Username | `root` |
| Password | Rỗng |
| Backend | CakePHP |
| Project root | `D:\project_LVTN\iot-energy` |

Port được xác nhận bằng:

```sql
SELECT @@port;
```

Kết quả:

```text
3306
```

## 3. Căn cứ xác định datasource

CakePHP load cấu hình theo thứ tự:

```text
config/app.php
    ↓ bị ghi đè bởi
config/app_local.php
```

Trong `config/bootstrap.php`:

```php
Configure::load('app', 'default', false);

if (file_exists(CONFIG . 'app_local.php')) {
    Configure::load('app_local', 'default');
}
```

Datasource cuối cùng trong `config/app_local.php`:

```text
host: localhost
port: không khai báo trực tiếp, MySQL Server được xác nhận chạy tại 3306
username: root
password: chuỗi rỗng
database: iot_energy
driver: Cake\Database\Driver\Mysql
timezone: +07:00
```

Trong `config/.env`, `DATABASE_URL` đang bị comment và không ghi đè datasource trên.

## 4. Nguyên tắc an toàn

Trong quá trình thực hiện:

- không chạy `cake migrations`;
- không import schema vào database chính `iot_energy`;
- không dump dữ liệu;
- không ghi password trực tiếp vào câu lệnh;
- không sửa thủ công nội dung dump để làm nó khớp code;
- không ghi đè schema chính trước khi kiểm tra;
- không commit `config/.env`;
- không commit file dump bị gián đoạn;
- không thay đổi cấu trúc database trong lúc dump.

Các lệnh không còn sử dụng trong workflow của dự án:

```powershell
php bin/cake.php migrations status
php bin/cake.php migrations migrate
php bin/cake.php migrations rollback
```

## 5. Cấu trúc thư mục đề xuất

```text
iot-energy/
├─ config/
│  ├─ Migrations/
│  └─ schema/
│     ├─ README.md
│     └─ iot_energy_schema.sql
├─ docs/
│  ├─ database/
│  │  └─ SCHEMA_DUMP_PROCEDURE.md
│  └─ reference/
│     └─ cakephp/
│        ├─ i18n.sql
│        └─ sessions.sql
```

Hai file `i18n.sql` và `sessions.sql` là template CakePHP, không phải schema runtime hiện tại.

## 6. Mở PowerShell tại project

```powershell
cd D:\project_LVTN\iot-energy
```

Kiểm tra:

```powershell
Get-Location
```

Kết quả mong muốn:

```text
D:\project_LVTN\iot-energy
```

## 7. Khai báo biến PowerShell

```powershell
$ProjectRoot = "D:\project_LVTN\iot-energy"

$DumpExe = "C:\wamp64\bin\mysql\mysql9.1.0\bin\mysqldump.exe"
$MysqlExe = "C:\wamp64\bin\mysql\mysql9.1.0\bin\mysql.exe"

$Database = "iot_energy"
$DbHost = "localhost"
$DbPort = 3306
$DbUser = "root"

$SchemaDir = Join-Path $ProjectRoot "config\schema"
$TempSchema = Join-Path $SchemaDir "iot_energy_schema.new.sql"
$FinalSchema = Join-Path $SchemaDir "iot_energy_schema.sql"
```

Các lệnh trên chỉ khai báo biến, chưa tạo file hoặc kết nối database.

## 8. Kiểm tra công cụ MySQL

```powershell
Test-Path $DumpExe
Test-Path $MysqlExe
```

Kết quả mong muốn:

```text
True
True
```

Kiểm tra phiên bản:

```powershell
& $DumpExe --version
& $MysqlExe --version
```

Kết quả đã xác nhận:

```text
mysqldump Ver 9.1.0 for Win64 on x86_64
mysql.exe Ver 9.1.0 for Win64 on x86_64
```

## 9. Tạo thư mục schema

```powershell
New-Item `
    -ItemType Directory `
    -Path $SchemaDir `
    -Force
```

Kiểm tra:

```powershell
Get-Item $SchemaDir | Select-Object FullName
```

## 10. Kiểm tra kết nối database

Lệnh sau chỉ đọc thông tin server:

```powershell
& $MysqlExe `
    "--host=$DbHost" `
    "--port=$DbPort" `
    "--user=$DbUser" `
    --skip-password `
    "--database=$Database" `
    --execute="SELECT DATABASE() AS current_database, VERSION() AS mysql_version, @@port AS mysql_port;"
```

Kết quả mong muốn:

```text
current_database    mysql_version    mysql_port
iot_energy          9.1.0            3306
```

## 11. Kiểm tra các bảng nguồn

```powershell
& $MysqlExe `
    "--host=$DbHost" `
    "--port=$DbPort" `
    "--user=$DbUser" `
    --skip-password `
    "--database=$Database" `
    --execute="SHOW TABLES;"
```

Các bảng nghiệp vụ cần có gồm:

```text
users
devices
iot_devices
energy_logs
alert_configs
alert_logs
hour_summaries
daily_summaries
month_summaries
electricity_price_tiers
```

Ngoài ra còn có thể có các bảng authentication như `refresh_tokens`, `user_otps`, `user_social_accounts` và `password_reset_tokens`.

## 12. Kiểm tra file tạm

```powershell
Test-Path $TempSchema
Test-Path $FinalSchema
```

Lần đầu tiên, kết quả lý tưởng:

```text
False
False
```

Nếu file tạm đã tồn tại, không dump đè trước khi kiểm tra.

## 13. Tạo schema dump

```powershell
& $DumpExe `
    "--host=$DbHost" `
    "--port=$DbPort" `
    "--user=$DbUser" `
    --skip-password `
    --default-character-set=utf8mb4 `
    --no-data `
    --no-create-db `
    --routines `
    --triggers `
    --events `
    --no-tablespaces `
    --skip-lock-tables `
    --skip-dump-date `
    --set-gtid-purged=OFF `
    "--ignore-table=${Database}.cake_migrations" `
    "--result-file=$TempSchema" `
    $Database

$DumpExitCode = $LASTEXITCODE
```

### Ý nghĩa các tùy chọn

| Tùy chọn | Ý nghĩa |
|---|---|
| `--no-data` | Không xuất dữ liệu |
| `--no-create-db` | Không tạo lệnh `CREATE DATABASE` |
| `--routines` | Xuất procedure và function |
| `--triggers` | Xuất trigger |
| `--events` | Xuất MySQL event |
| `--no-tablespaces` | Tránh yêu cầu quyền `PROCESS` |
| `--skip-lock-tables` | Không khóa bảng |
| `--skip-dump-date` | Loại timestamp gây Git diff không cần thiết |
| `--set-gtid-purged=OFF` | Không xuất GTID local |
| `--ignore-table` | Loại bảng `cake_migrations` |
| `--result-file` | Để `mysqldump` ghi file đúng encoding |
| `--skip-password` | Kết nối bằng password rỗng |

`mysqldump` thường không hiển thị tiến độ. Chờ đến khi PowerShell trả lại dấu nhắc.

## 14. Xử lý cảnh báo password

Nếu xuất hiện:

```text
Using a password on the command line interface can be insecure.
```

thì câu lệnh thực tế đã truyền option password theo cách MySQL cảnh báo. Với cấu hình password rỗng, chỉ dùng:

```powershell
--skip-password
```

Không dùng đồng thời `--password`, `--password=` hoặc `--password=""`.

## 15. Xác nhận dump hoàn tất

```powershell
$DumpExitCode
```

Kết quả bắt buộc:

```text
0
```

```powershell
if ($DumpExitCode -eq 0) {
    Write-Output "Dump thành công: $TempSchema"
} else {
    Write-Error "Dump thất bại. Exit code: $DumpExitCode"
}
```

## 16. Kiểm tra file không rỗng

```powershell
Get-Item $TempSchema | Select-Object FullName, Length, LastWriteTime
```

Kết quả thực hành đã ghi nhận file có kích thước `13478` byte.

```powershell
if ((Get-Item $TempSchema).Length -le 0) {
    throw "File schema đang rỗng."
}
```

## 17. Kiểm tra phần cuối file

```powershell
Get-Content $TempSchema -Tail 20
```

Dump hoàn chỉnh phải có phần khôi phục session variables và kết thúc bằng:

```sql
-- Dump completed
```

Trong lần thực hành đã xác nhận file có dòng kết thúc này.

## 18. Kiểm tra không chứa dữ liệu

```powershell
$ContainsData = Select-String `
    -Path $TempSchema `
    -Pattern "INSERT INTO|REPLACE INTO" `
    -Quiet

if ($ContainsData) {
    throw "Schema dump chứa dữ liệu."
} else {
    Write-Output "OK: dump không chứa dữ liệu."
}
```

Kiểm tra thêm:

```powershell
$ContainsValues = Select-String `
    -Path $TempSchema `
    -Pattern "VALUES\s*\(" `
    -Quiet

if ($ContainsValues) {
    Write-Warning "Phát hiện VALUES(...), cần kiểm tra thủ công."
}
```

## 19. Kiểm tra không chứa `cake_migrations`

```powershell
$ContainsCakeMigrations = Select-String `
    -Path $TempSchema `
    -Pattern "cake_migrations" `
    -Quiet

if ($ContainsCakeMigrations) {
    throw "Dump vẫn chứa cake_migrations."
} else {
    Write-Output "OK: dump không chứa cake_migrations."
}
```

## 20. Kiểm tra không ép tên database

```powershell
$ContainsDatabaseCommand = Select-String `
    -Path $TempSchema `
    -Pattern "CREATE DATABASE|^USE " `
    -Quiet

if ($ContainsDatabaseCommand) {
    throw "Dump chứa CREATE DATABASE hoặc USE."
} else {
    Write-Output "OK: dump không ép tên database."
}
```

## 21. Liệt kê các bảng trong dump

```powershell
Select-String -Path $TempSchema -Pattern "^CREATE TABLE"
```

Kiểm tra từng bảng bắt buộc:

```powershell
$RequiredTables = @(
    "users",
    "devices",
    "iot_devices",
    "energy_logs",
    "alert_configs",
    "alert_logs",
    "hour_summaries",
    "daily_summaries",
    "month_summaries",
    "electricity_price_tiers"
)

foreach ($Table in $RequiredTables) {
    $Found = Select-String `
        -Path $TempSchema `
        -Pattern "CREATE TABLE ``$Table``" `
        -Quiet

    if ($Found) {
        Write-Output "OK: $Table"
    } else {
        Write-Warning "Thiếu bảng: $Table"
    }
}
```

## 22. Kiểm tra các cột quan trọng

```powershell
$RequiredFields = @(
    "iot_device_id",
    "last_seen_at",
    "threshold_value",
    "last_learned_date",
    "user_note",
    "activated_at",
    "rated_power"
)

foreach ($Field in $RequiredFields) {
    $Found = Select-String `
        -Path $TempSchema `
        -Pattern "``$Field``" `
        -Quiet

    if ($Found) {
        Write-Output "OK field: $Field"
    } else {
        Write-Warning "Không tìm thấy field: $Field"
    }
}
```

Sau đó kiểm tra thủ công field thuộc đúng bảng:

```text
devices.iot_device_id
devices.rated_power
devices.activated_at
iot_devices.last_seen_at
alert_configs.last_learned_date
alert_logs.threshold_value
month_summaries.user_note
```

## 23. Kiểm tra index và foreign key

```powershell
Select-String `
    -Path $TempSchema `
    -Pattern "FOREIGN KEY|UNIQUE KEY|UNIQUE INDEX|CREATE INDEX"
```

Các liên kết cần kiểm tra:

```text
devices.user_id → users.id
devices.iot_device_id → iot_devices.id
energy_logs.device_id → devices.id
alert_configs.device_id → devices.id
alert_logs.alert_config_id → alert_configs.id
alert_logs.energy_log_id → energy_logs.id
hour_summaries.device_id → devices.id
daily_summaries.device_id → devices.id
month_summaries.device_id → devices.id
```

Nếu constraint sai, sửa database MySQL rồi dump lại; không sửa trực tiếp file dump.

## 24. Kiểm tra `DEFINER`

```powershell
Select-String -Path $TempSchema -Pattern "DEFINER"
```

- Không có kết quả: có thể tiếp tục.
- Có kết quả: kiểm tra trigger, view, routine hoặc event trước khi import.

## 25. So sánh với schema hiện tại

Nếu `$FinalSchema` đã tồn tại:

```powershell
git diff --no-index -- $FinalSchema $TempSchema
```

Exit code `1` của `git diff --no-index` chỉ có nghĩa hai file khác nhau, không phải lỗi hệ thống.

Kiểm tra kỹ bảng, cột, kiểu dữ liệu, nullable, default, index, unique, foreign key và collation.

## 26. Tạo database test

```powershell
$TestDatabase = "iot_energy_schema_test_$(Get-Date -Format yyyyMMddHHmmss)"
$TestDatabase
```

Tên này tuyệt đối không được là `iot_energy`.

```powershell
& $MysqlExe `
    "--host=$DbHost" `
    "--port=$DbPort" `
    "--user=$DbUser" `
    --skip-password `
    --execute="CREATE DATABASE $TestDatabase CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

$CreateTestDbExitCode = $LASTEXITCODE

if ($CreateTestDbExitCode -ne 0) {
    throw "Không tạo được database test."
}
```

Đây là thao tác tạo database test mới, không thay đổi database chính.

## 27. Import schema vào database test

```powershell
$SourcePath = $TempSchema.Replace("\", "/")
```

```powershell
& $MysqlExe `
    "--host=$DbHost" `
    "--port=$DbPort" `
    "--user=$DbUser" `
    --skip-password `
    "--database=$TestDatabase" `
    "--execute=SOURCE $SourcePath;"

$ImportExitCode = $LASTEXITCODE

if ($ImportExitCode -eq 0) {
    Write-Output "Import thành công vào $TestDatabase"
} else {
    throw "Import schema thất bại."
}
```

Nếu import thất bại, không cập nhật schema chính.

## 28. Kiểm tra database test

Liệt kê bảng:

```powershell
& $MysqlExe `
    "--host=$DbHost" `
    "--port=$DbPort" `
    "--user=$DbUser" `
    --skip-password `
    "--database=$TestDatabase" `
    --execute="SHOW TABLES;"
```

Kiểm tra bảng trọng yếu:

```powershell
& $MysqlExe `
    "--host=$DbHost" `
    "--port=$DbPort" `
    "--user=$DbUser" `
    --skip-password `
    "--database=$TestDatabase" `
    --execute="SHOW CREATE TABLE devices; SHOW CREATE TABLE iot_devices; SHOW CREATE TABLE alert_configs; SHOW CREATE TABLE alert_logs; SHOW CREATE TABLE month_summaries;"
```

Kiểm tra không có dữ liệu:

```powershell
& $MysqlExe `
    "--host=$DbHost" `
    "--port=$DbPort" `
    "--user=$DbUser" `
    --skip-password `
    "--database=$TestDatabase" `
    --execute="SELECT COUNT(*) AS users_count FROM users; SELECT COUNT(*) AS devices_count FROM devices; SELECT COUNT(*) AS logs_count FROM energy_logs;"
```

Các count phải bằng `0`.

## 29. Đưa file tạm thành schema chính

Chỉ thực hiện sau khi import test thành công.

Nếu chưa có file chính:

```powershell
Move-Item `
    -LiteralPath $TempSchema `
    -Destination $FinalSchema
```

Nếu đã có file chính:

```powershell
$PreviousSchema = "$FinalSchema.previous"

Copy-Item `
    -LiteralPath $FinalSchema `
    -Destination $PreviousSchema `
    -Force

Move-Item `
    -LiteralPath $TempSchema `
    -Destination $FinalSchema `
    -Force
```

Kiểm tra:

```powershell
Get-Item $FinalSchema | Select-Object FullName, Length, LastWriteTime
```

File chính phải là:

```text
D:\project_LVTN\iot-energy\config\schema\iot_energy_schema.sql
```

## 30. Xử lý file dump bị gián đoạn

File có hậu tố `.interrupted` không phải schema chính thức:

- không import;
- không commit;
- không sử dụng để dựng database;
- có thể giữ tạm làm minh chứng thử nghiệm;
- sau khi hoàn tất báo cáo có thể loại khỏi project.

## 31. README cho thư mục schema

Nội dung đề xuất cho `config/schema/README.md`:

```markdown
# Database schema

`iot_energy_schema.sql` là nguồn schema chính thức của project.

Project không sử dụng CakePHP migrations.

Mọi thay đổi schema được thực hiện trực tiếp trên MySQL, sau đó:

1. Cập nhật backend/frontend tương ứng.
2. Tạo lại schema dump.
3. Kiểm tra dump không chứa dữ liệu.
4. Kiểm tra không chứa `cake_migrations`.
5. So sánh với schema cũ.
6. Import thử vào database test.
7. Chỉ sau khi thành công mới thay file schema chính.
8. Commit schema và code liên quan cùng nhau.

Không commit dữ liệu người dùng, API key, password, token, OTP,
energy log, alert log hoặc full database backup.
```

## 32. Cấu hình `.gitignore`

Chỉ ignore file tạm:

```gitignore
/config/schema/*.new.sql
/config/schema/*.interrupted
/config/schema/*.previous
/config/schema/*.bak
```

Không ignore toàn bộ `.sql` vì `iot_energy_schema.sql` cần được Git theo dõi.

## 33. Kiểm tra Git

```powershell
git status --short
```

Kiểm tra `.env`:

```powershell
git check-ignore config/.env
git ls-files config/.env
```

Kết quả an toàn:

- `git check-ignore` hiển thị `config/.env`;
- `git ls-files` không có output.

Kiểm tra schema:

```powershell
git diff -- config/schema/iot_energy_schema.sql
```

## 34. Quy trình cập nhật schema về sau

Mỗi lần thay đổi database:

1. Backup nếu thay đổi có rủi ro.
2. Sửa schema trực tiếp trên MySQL.
3. Cập nhật Table, Entity, Service và Controller.
4. Cập nhật TypeScript type/payload nếu API thay đổi.
5. Dump vào file `.new.sql`.
6. Kiểm tra exit code.
7. Kiểm tra không có dữ liệu.
8. Kiểm tra không có `cake_migrations`.
9. Kiểm tra bảng, cột, index và foreign key.
10. So sánh với schema hiện tại.
11. Import vào database test mới.
12. Chỉ khi pass mới thay schema chính.
13. Commit schema và code liên quan cùng nhau.

## 35. Danh sách minh chứng nên chụp

| STT | Minh chứng |
|---:|---|
| 1 | `Get-Location` đúng thư mục project |
| 2 | Phiên bản `mysql` và `mysqldump` |
| 3 | Kết nối đúng database, version và port |
| 4 | `SHOW TABLES` của database nguồn |
| 5 | File dump có kích thước lớn hơn 0 |
| 6 | Phần cuối có `-- Dump completed` |
| 7 | Không có `INSERT INTO` |
| 8 | Danh sách `CREATE TABLE` |
| 9 | Import thành công vào database test |
| 10 | `SHOW TABLES` và count bằng 0 trong database test |
| 11 | File chính `iot_energy_schema.sql` |
| 12 | Git diff/schema được theo dõi |
| 13 | `.env` được Git ignore |

## 36. Trạng thái thực hành đã ghi nhận

| Hạng mục | Trạng thái |
|---|---|
| MySQL tools tồn tại | Đã xác nhận |
| MySQL tools đúng phiên bản 9.1.0 | Đã xác nhận |
| Host/database/user/port | Đã xác nhận |
| Dump tạo file | Đã xác nhận |
| File không rỗng | Đã xác nhận, 13478 byte |
| Dump ghi đến cuối | Đã xác nhận qua `-- Dump completed` |
| Không chứa dữ liệu | Cần lưu kết quả kiểm tra làm minh chứng |
| Không chứa `cake_migrations` | Cần lưu kết quả kiểm tra làm minh chứng |
| Đủ bảng/cột/foreign key | Cần lưu kết quả kiểm tra làm minh chứng |
| Import database test thành công | Cần lưu kết quả kiểm tra làm minh chứng |
| Đổi thành `iot_energy_schema.sql` | Chưa xác nhận trong tài liệu thực hành |
| File `.interrupted` được loại khỏi repo | Chưa xác nhận trong tài liệu thực hành |
