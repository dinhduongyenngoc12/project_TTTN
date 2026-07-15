//npm install react-hook-form zod @hookform/resolvers

import { z } from "zod";

const weakPasswords = ["00000000", "11111111", "12345678", "87654321", "88888888"];

//trim: xoa khoang trang dau&cuoi
// ^ batdau   $ ketthuc   (\d) lay chu so dau tien   \1+ cac ky tu sau phai giong so dau tien

export const registerSchema = z.object({
    username: z
        .string()
        .trim()
        .min(1, "Username không được để trống")
        .min(2, "Username phải có ít nhất 2 ký tự")
        .max(50, "Username không được vượt quá 50 ký tự")
        .regex(
            /^[a-zA-Z0-9_]+$/,
            "Username chỉ được chứa chữ, số và dấu gạch dưới"),

    email: z
        .email({
            message: "Email không đúng định dạng",
        })
        .trim()
        .min(1, "Email không được để trống")
        .max(255, "Email không được vượt quá 255 ký tự"),


    password: z
        .string()
        .trim()
        .min(1, "Mật khẩu không được để trống")
        .length(8, "Mật khẩu phải có đúng 8 ký tự")
        .regex(/^[0-9]+$/, "Mật khẩu chỉ được chứa số")
        .refine((value) => !weakPasswords.includes(value), {
            message: "Mật khẩu quá phổ biến, vui lòng chọn mật khẩu khác",
        })
        .refine((value) => !/^(\d)\1+$/.test(value), {
            message: "Mật khẩu không được là một chữ số lặp lại"
        }),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;