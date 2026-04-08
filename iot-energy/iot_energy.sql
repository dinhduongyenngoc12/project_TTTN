-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1:3306
-- Thời gian đã tạo: Th4 08, 2026 lúc 06:46 AM
-- Phiên bản máy phục vụ: 9.1.0
-- Phiên bản PHP: 8.4.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `iot_energy`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `devices`
--

DROP TABLE IF EXISTS `devices`;
CREATE TABLE IF NOT EXISTS `devices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `devices`
--

INSERT INTO `devices` (`id`, `name`, `user_id`) VALUES
(1, 'Máy lạnh phòng khách', 1),
(2, 'Tủ lạnh', 1),
(3, 'Máy giặt', 2),
(4, 'Máy bơm nước sinh hoạt', 3);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `energy_logs`
--

DROP TABLE IF EXISTS `energy_logs`;
CREATE TABLE IF NOT EXISTS `energy_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `device_id` int DEFAULT NULL,
  `power` float DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `energy_logs`
--

INSERT INTO `energy_logs` (`id`, `device_id`, `power`, `created_at`) VALUES
(1, 1, 750, '2026-04-01 14:54:28'),
(2, 1, 820, '2026-04-01 14:54:28'),
(3, 2, 400, '2026-04-01 14:54:28'),
(4, 2, 520, '2026-04-01 14:54:28'),
(5, 3, 550, '2026-04-01 14:54:28'),
(6, 3, 1050, '2026-04-01 14:54:28'),
(7, 4, 200, '2026-04-01 14:54:28'),
(8, 4, 1300, '2026-04-01 14:54:28'),
(9, NULL, NULL, '2026-04-01 10:11:33'),
(10, 1, NULL, '2026-04-02 08:23:22'),
(11, 1, NULL, '2026-04-02 08:25:55'),
(12, 1, NULL, '2026-04-02 08:27:11'),
(13, 1, NULL, '2026-04-02 08:27:14'),
(14, 1, NULL, '2026-04-02 08:28:37'),
(15, 1, NULL, '2026-04-02 08:28:39');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` varchar(512) NOT NULL,
  `expires_at` datetime NOT NULL,
  `is_revoked` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_used_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_token` (`token`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `refresh_tokens`
--

INSERT INTO `refresh_tokens` (`id`, `user_id`, `token`, `expires_at`, `is_revoked`, `created_at`, `last_used_at`) VALUES
(1, 7, '2b746cc6f4938c06a71bcf33de2e3bef6c8a7cd713404ced93848a80a021e67d5a3edbddd6f4aba80abbad48a9051da856c764beed32e57b15bd90c236444e7f', '2026-04-10 15:51:26', 0, '2026-04-07 15:51:26', '2026-04-07 15:51:26'),
(2, 7, 'bd1fa75a1752b5ddde57825bc360c48e38e6f754529492b749c9a825a29a9ee94546a891bb044545216eee180878d786beb9a8340631685f7471f2b4fcad3646', '2026-04-10 15:54:30', 0, '2026-04-07 15:54:30', '2026-04-07 15:54:30'),
(3, 8, '3ff60edaa39245b28477ca9b2447c7cd579f69aee765ebdbf97b0598eb0366048130e1c6a4a98156a10e97551e7eb7c0d9691df09fc6ed0477be3a699c171912', '2026-04-10 16:15:45', 0, '2026-04-07 16:15:45', '2026-04-07 16:15:45'),
(4, 8, '66f57aee4f8b877545391e786381e45050726f580d8cc86d01b1b1da9e29f1381225facd3ea0f9eb84cd5aee8b127ffa7648570f3e33563da5974086f429b6e1', '2026-04-10 16:16:38', 0, '2026-04-07 16:16:38', '2026-04-07 16:16:38'),
(5, 8, '3f2e4ff21be474a1e43d5a08f56cda11fe8007efd1c316838e2212893cfadaf8c4a1ea1d2f0350f3901f5c283b50e8e898d089ca7636eaa2cfb7948e60dd426b', '2026-04-10 16:30:36', 0, '2026-04-07 16:30:36', '2026-04-07 16:30:36'),
(6, 8, '3bacd2f2bd21f9620f8f7b3d870ac786150613963a689dd11f06dd1583ce2672bf5596260ea3a72fa640d57cace6813f8b0a332d56ae19fad35f06597e57fe4a', '2026-04-10 16:30:49', 0, '2026-04-07 16:30:49', '2026-04-07 16:30:49'),
(7, 8, '10b929eb3c6b9552a42545eeec460992b0db5e84dde1c3ea64a489cbaa587ade0fd7289fddec28dd4d4fe5450b554c02163b5b3aee37f5bd1177a775a9e7ae12', '2026-04-11 01:59:16', 0, '2026-04-08 01:59:16', '2026-04-08 01:59:16'),
(8, 8, 'f1355277c65a43da1b3cf43eb83a5f173ad82db6154f55d2b8da52a1201f03ec56fc737c32a7b22cfffdef6e0e5b17e16c2b55d4af6f9df140d4697dab9eaca8', '2026-04-11 02:43:21', 0, '2026-04-08 02:43:21', '2026-04-08 02:43:21'),
(9, 9, '6074bb3b6ae1c366ae18661227a6204419f2576b7b041b9394c8011bf51105f5e19f9d447ed009702d5b8588ad301ab183ce31acbb3ddf80a9c3e1e4542dd27d', '2026-04-11 02:51:29', 0, '2026-04-08 02:51:29', '2026-04-08 02:51:29');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `thresholds`
--

DROP TABLE IF EXISTS `thresholds`;
CREATE TABLE IF NOT EXISTS `thresholds` (
  `id` int NOT NULL AUTO_INCREMENT,
  `device_id` int DEFAULT NULL,
  `max_power` float DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `thresholds`
--

INSERT INTO `thresholds` (`id`, `device_id`, `max_power`) VALUES
(1, 1, 800),
(2, 2, 500),
(3, 3, 600),
(4, 4, 1500);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(10) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `email`) VALUES
(1, 'admin', '$2y$12$6RDVG7U1b0CmjD/YCUKL9.GoxPOCYNmSsoKDVXa8xPn1d8uq.bCty', 'admin', 'admin@gmail.com'),
(2, 'user1', '$2y$12$4cw3CNUoOgiDxg6LJ7cXRujR/OXsCIR/hbtXvKMFXe5ilMmby6CCS', 'member', 'user1@gmail.com'),
(3, 'user2', '$2y$12$YA1fkGLE.RWapAbZcb1VIOsDF64R.5.1FMNXv70DBjrdsvSdBHJL2', 'member', 'user2@gmail.com'),
(7, 'testuser', '$2y$12$8JnMJLiCUQsRtG0sZYyLBOplt.FLN9wpm855I22jQJJvvo39BV.PW', NULL, 'testuser@gmail.com'),
(8, 'apitest_0407', '$2y$12$POqciYT0d0PKZAsaE7aB7OrmaJviXkKeGZzgCtAY70XJ94EVJiDY2', NULL, 'apitest_0407@example.com'),
(9, 'yenngoc', '$2y$12$QOir7ZkP7LcTpiI26qvWnedLCpSN53OOIdutkw.gFYAz3Z/Ex4Gom', NULL, 'dinhduongyenngoc@gmail.com');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
