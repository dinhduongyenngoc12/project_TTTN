<?php
declare(strict_types=1);

namespace App\Service;

use App\Model\Entity\Device;
use App\Model\Entity\User;
use Cake\I18n\FrozenTime;
use Cake\Log\Log;
use Cake\Mailer\Mailer;
use Throwable;

class MailService
{
  public function sendOtp(string $otp, string $email): bool
    {
        $subject = "[IoT Energy] Mã xác thực đăng nhập (OTP)";
        
        $body = "Chào bạn,\n\n";
        $body .= "Bạn vừa yêu cầu mã xác thực (OTP) để truy cập vào Hệ thống giám sát điện năng IoT Energy.\n\n";
        $body .= "Mã OTP của bạn là: " . $otp . "\n\n";
        $body .= "Mã này có hiệu lực trong vòng 5 phút. Vui lòng không chia sẻ mã này với bất kỳ ai để đảm bảo an toàn cho tài khoản của bạn.\n\n";
        $body .= "Nếu bạn không thực hiện yêu cầu này, xin vui lòng bỏ qua email hoặc liên hệ với quản trị viên hệ thống.\n\n";
        $body .= "Trân trọng,\n";
        $body .= "Hệ thống IoT Energy";

        return $this->sendTextMail(
            $email,
            $subject,
            $body,
            "Gửi email OTP thất bại"
        );
    }

    public function sendResetPasswordLink(string $resetLink, string $email): bool
    {
        $body =
            "Xin chào,\n\n" .
            "Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản IoT Energy.\n\n" .
            "Vui lòng bấm vào liên kết bên dưới để đặt lại mật khẩu:\n" .
            $resetLink . "\n\n" .
            "Liên kết này có hiệu lực trong 5 phút và chỉ dùng được một lần.\n\n" .
            "Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.\n\n" .
            "Trân trọng,\n" .
            "Hệ thống IoT Energy";

        return $this->sendTextMail(
            $email,
            'Đặt lại mật khẩu - IoT Energy',
            $body,
            'Send reset password mail failed'
        );
    }

    public function sendPowerAlertEmail(User $user, Device $device, float $powerValue, float $threshold): array 
    {
        $body =
            "Xin chào {$user->username},\n\n" .
            "Hệ thống IoT Energy phát hiện thiết bị \"{$device->name}\" đang vượt ngưỡng công suất.\n\n" .
            "Thông tin cảnh báo:\n" .
            "- Thiết bị: {$device->name}\n" .
            "- Công suất đo được: {$powerValue} W\n" .
            "- Ngưỡng cảnh báo: {$threshold} W\n" .
            "- Thời điểm: " . FrozenTime::now()->format('H:i:s d/m/Y') . "\n\n" .
            "Vui lòng kiểm tra thiết bị để đảm bảo an toàn và tối ưu việc sử dụng điện.\n\n" .
            "Trân trọng,\n" .
            "Hệ thống IoT Energy";

        $sent = $this->sendTextMail(
            $user->email,
            'Cảnh báo vượt ngưỡng công suất - IoT Energy',
            $body,
            'Send power alert mail failed'
        );

        return [
            'success' => $sent,
            'message' => $sent
                ? 'Gửi email cảnh báo thành công'
                : 'Gửi email cảnh báo thất bại',
        ];
    }

    private function sendTextMail(
        string $to,
        string $subject,
        string $body,
        string $logMessage
    ): bool {
        try {
            $mailer = new Mailer('default');

            $mailer
                // OTP, đặt lại mật khẩu và cảnh báo cùng dùng người gửi
                // đã cấu hình trong Email.default của app_local.php.
                ->setTo($to)
                ->setSubject($subject)
                ->deliver($body);

            return true;
        } catch (Throwable $e) {
            Log::error($logMessage . ': ' . $e->getMessage());

            return false;
        }
    }
}
