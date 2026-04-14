<?php
namespace App\Controller\Component;
use Cake\Controller\Component;
use Cake\Mailer\Mailer;
use App\Controller\AppController;


class ComonComponent extends Component{

    function randomOTP($length = 6) {
        return str_pad(random_int(0, pow(10, $length) - 1), $length, '0', STR_PAD_LEFT);
        //str_pad in so so 0 con thieu trong chuoi 6 so ngau nhien
    }
    public function sendOTP(string $otp, string $email): bool{
        
        $mailer=new Mailer('default');
        $mailer->setTo($email)
        ->setSubject('OTP')
        ->deliver('Ma OTP cua ban la: ' .$otp); 

        return true;
    }

}
