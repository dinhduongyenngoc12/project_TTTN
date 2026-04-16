-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1:3306
-- Thời gian đã tạo: Th4 16, 2026 lúc 10:12 AM
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
  `photo_path` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `devices`
--

INSERT INTO `devices` (`id`, `name`, `user_id`, `photo_path`) VALUES
(1, 'Máy lạnh phòng khách', 1, 'uploads\\devices\\photo\\maylanh.jpg'),
(2, 'Tủ lạnh', 1, 'uploads\\devices\\photo\\tulanh.jpg'),
(3, 'Máy giặt', 2, 'uploads\\devices\\photo\\maygiat.jpg'),
(4, 'Máy bơm nước sinh hoạt', 3, 'uploads\\devices\\photo\\maybomnuoc.jpg');

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
) ENGINE=InnoDB AUTO_INCREMENT=50 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
(9, 9, '6074bb3b6ae1c366ae18661227a6204419f2576b7b041b9394c8011bf51105f5e19f9d447ed009702d5b8588ad301ab183ce31acbb3ddf80a9c3e1e4542dd27d', '2026-04-11 02:51:29', 0, '2026-04-08 02:51:29', '2026-04-08 02:51:29'),
(10, 9, 'd9f919a8c4969319e1d2ae264736486ce2e0e7c3223e619b18a7c427331acd3d5f84b9fc25753ab833e40a9fd329a177e9f16a2348da67ed035c02f032b8ac18', '2026-04-11 08:22:22', 0, '2026-04-08 08:22:22', '2026-04-08 08:22:22'),
(11, 9, 'ce07706e6b19ad1a2e22c52571c4ccd05fe612077643fda73fb28d11226049faacdd3357cc548b32f8f781a356d84a8c71428737b72a0fae4960c0d17a1f71a5', '2026-04-16 02:07:35', 0, '2026-04-13 02:07:36', '2026-04-13 02:07:36'),
(12, 10, 'bbe077311e4b2ab01026d1510df76628f74ea2fc296ecf3eb2dcf88c5b425164eb55cfdb9cb4840bf898c8128321ae8bf3066e1cd67f5b88d85fe8d873992233', '2026-04-13 02:22:17', 0, '2026-04-13 02:21:47', '2026-04-13 02:21:47'),
(13, 10, '46b0b362a46d638ca25d46094e1f45c01c5376e20058a97b750288a72b0ef85c97cb2e27a73f12531a5c73d415e7816a293762aee570092420658fc0616205cb', '2026-04-13 02:24:45', 0, '2026-04-13 02:24:15', '2026-04-13 02:24:15'),
(14, 10, '9862f97265b347adddc9931dca634b21c03df17b762227b0cace1da966864ca13aefd3bae12210dee5d97943a3e50859473ecfbea69c33bb76ac20c69dafc094', '2026-04-13 02:24:57', 0, '2026-04-13 02:24:27', '2026-04-13 02:24:27'),
(15, 10, '3252efc1a725576a95cf5af5b1b8c3d6202cb714df67cfcc8f563d6d57cac20eb46128e0d5dc1237e9bc42cf313fd2c8f3c3a7e78a1c96c0c05e83fe41a9600c', '2026-04-13 02:26:04', 0, '2026-04-13 02:25:34', '2026-04-13 02:25:34'),
(16, 10, 'bc5b09a76943e53cf8b53eef1635861e48e75a0079fe92bcec41fdfff0bf037f044459a5832623e35a968d4ed95ce9d41a0da334f9d8f92d653d70f262904118', '2026-04-13 02:27:45', 0, '2026-04-13 02:27:15', '2026-04-13 02:27:15'),
(17, 10, 'e1a19778fa37f96313022bb057cdc00e6701d544e84ee1b03a611c081f8557ae021f8628ec68313393ce593288e578473fcac40dbd70d9a2f8966c36f3e9527c', '2026-04-13 02:56:54', 0, '2026-04-13 02:56:24', '2026-04-13 02:56:24'),
(18, 10, '56ffb71f5cba9590fce908fc035b43c521262943b5f4b915c9d9361d71f57b1343590b4a428c714b82bcddfc5895ae0ee918f87392e807b67b4fe9fff817b1cc', '2026-04-13 02:57:41', 0, '2026-04-13 02:57:11', '2026-04-13 02:57:11'),
(19, 10, 'acec099baf511ff0710684c0766832bbbeae27562f7cbbbb5ff7e28a079ec1465df7b74457b4dc81fd93530f25ca57ff0a60e50ca8c23f163fee979021eb7432', '2026-04-13 03:02:30', 0, '2026-04-13 03:02:00', '2026-04-13 03:02:00'),
(20, 10, '4102a7be21bdd1223d5bc97c8a1fdee7f172c2a9c7ffa94fe07ba573c617b3e051d27c8395c67168b8cde71291a22cfdebaa12506a48f5cd628ea217de3d58bf', '2026-04-13 03:03:10', 0, '2026-04-13 03:02:40', '2026-04-13 03:02:40'),
(21, 10, '83a04fd8ffb92d2d78013eb3301778e3f6797c35ebf770e04c82a5dcd11c5f7c48521cfdc57ade2b3081380bb04b04fae62508092abbad0dfc29285147056782', '2026-04-13 03:04:48', 0, '2026-04-13 03:04:18', '2026-04-13 03:04:18'),
(22, 10, '863d1b4148c8fcae8628b6f8cc11e2238b8f385655fdce6b325f2599b72bea4d586d00340176c2e5694b09382bcbf468a54a7762025f91df6c49db80d6641bce', '2026-04-13 03:06:56', 0, '2026-04-13 03:06:26', '2026-04-13 03:06:26'),
(23, 10, 'da58a8ed045dafc6c14540c17fcba39cf06750ca990609611f231ef080e2541cd1176cbc85a377f087fa8be1216070b00633a6a5f6d573b4e97d93a38baea6f7', '2026-04-13 03:14:36', 0, '2026-04-13 03:14:06', '2026-04-13 03:14:06'),
(24, 10, '17e928080b7ae4ff92d2abb23b00de4d140ae735cb562dace57df9dda94300b54d5b9955b232ac0c08fb147241fc82d3f04947e4fd75b326fc9ed1e8ba578214', '2026-04-13 03:15:19', 0, '2026-04-13 03:14:49', '2026-04-13 03:14:49'),
(25, 10, '0159dcdf6806be839454210b40cf5a0b646b64b2e76330fd8018b41710d79519b726863587b7c161ee14ff2f2271a5e9c803ef424cad1cd380f94b134db90885', '2026-04-13 03:17:20', 0, '2026-04-13 03:16:50', '2026-04-13 03:16:50'),
(26, 10, '1c29c338ca0c0c163aeab79b92cf2e7406f7b0ec89c5f0d3de8aa73b41ab55c8cc2b4e37ccbee9394bafb879ab67d6b86b52956d67c52f799124a49b621f83e9', '2026-04-13 03:22:46', 0, '2026-04-13 03:22:16', '2026-04-13 03:22:16'),
(27, 10, 'dc5c0c78b750faa38615d3e4a7cd90204c181615c7f40826057bd2e50dac033bfee526f7a2b460329dac0d73001c0e8cd9bdadcd461f3dcf57bec251723607d2', '2026-04-13 03:23:57', 0, '2026-04-13 03:23:27', '2026-04-13 03:23:27'),
(28, 10, 'ba0acda1b285a7710c99bc1ad0515a9cb6566eb33a158512e7c45982accf74b92fff6d67b7ef0121d3b23cfa1ab03587d32cbcca0a9bd18166651d4cb2f2bf5d', '2026-04-13 03:24:03', 0, '2026-04-13 03:23:33', '2026-04-13 03:23:33'),
(29, 10, '42712c31fbf7ad8e2d96b5fd618c39af48a14225f35fc41151afe322e873d483d42aae84115fe58f8570c48c41515bec14104cfd3583ff4f0c0ceb1f63b0738e', '2026-04-13 03:32:41', 0, '2026-04-13 03:32:11', '2026-04-13 03:32:11'),
(30, 10, '0f1ced544f6996ae1cf8dcd30452c1b52d462973e13a722d6e1e6b6e41001731da499479bbbb31080e9bb05691cadd795624e1a6bb554bd0617140f9555a7dfd', '2026-04-13 03:33:30', 0, '2026-04-13 03:33:00', '2026-04-13 03:33:00'),
(31, 10, '419d7da44e8ae50823b18b9465214a9ecacb53c03ed3f6f388e78bd1c31678c56fda34660889300d3c3cbb0ef911d29d6f11892c04c49194200da77806daf2e5', '2026-04-13 03:35:52', 0, '2026-04-13 03:35:23', '2026-04-13 03:35:23'),
(32, 10, 'cec1c9e3f0bb160b0e978d6af75b40a48fe0014844295240677385cefcc7d2e81524daf48aa5fc8c04d53612c89eaa7eb27a4e43bc9623a7c46008aca37aad11', '2026-04-13 03:42:26', 0, '2026-04-13 03:41:56', '2026-04-13 03:41:56'),
(33, 10, 'a1cfa9880adb6decdfbdd1ec56d8099ca29c54ea7b6b62d52ad38a4db3220a283a6adf19ab5043c4aaa702cb17d30df106b6731dc950625e2eb5a79bdc440da1', '2026-04-13 04:13:48', 0, '2026-04-13 04:13:18', '2026-04-13 04:13:18'),
(34, 10, '430aedb0b78e1288d2d9939b05eb361ffa3aa9a2cb9d6aee2800f35976f2fc2af9bae981f8c7659297cf3e08bbbf7bcecbfbde3bf1c5e25d83cc28adcc5afc17', '2026-04-13 04:14:34', 0, '2026-04-13 04:14:04', '2026-04-13 04:14:04'),
(35, 10, '6f6499db8a7652cf6549711e03cf561fbd7f3346084fdf7b59a09023c8418ee55e07cfa295405f2b4aaead7e0ba57a53c50f10104603acc03f75c7cf531eb5e4', '2026-04-13 04:19:59', 0, '2026-04-13 04:19:29', '2026-04-13 04:19:29'),
(36, 10, 'c436e9984201ef4279fc77e0e45d751414ad6b1197a66b6d12ce32341ece0de08d9e804dc3ede5488ebdb6a00d95265745ac9454dcd626fcd5aa86afb8c8f9b2', '2026-04-13 04:22:02', 0, '2026-04-13 04:21:32', '2026-04-13 04:21:32'),
(37, 10, 'cfb07b7cd0319ac6fb651e28e154ecab8421422cf0c7960c5712002532032a05f5a43eb70566e410c01adeee48af03e279ba54a833ec2938ea8329b7dffbd2c8', '2026-04-13 06:26:19', 0, '2026-04-13 06:25:49', '2026-04-13 06:25:49'),
(38, 10, 'adb788306c9cadf39b7c6d26a45d70b3ed72d097d005584ea652e461f8873621f4f00d627613326715b9cf87a5f508bd690da1638ba9b847a60700d2894df8ad', '2026-04-13 08:33:46', 0, '2026-04-13 08:33:16', '2026-04-13 08:33:16'),
(39, 10, '05a635caf403fe38a22287f0ca78c8175446fe32daa703c1bf01b20ae52866020cb95ed2a298b6692152e542460a3fd3df4cf2b0f4b53d491fb0f77ce95abdab', '2026-04-13 08:34:17', 0, '2026-04-13 08:33:47', '2026-04-13 08:33:47'),
(40, 10, '486535e1e766e56acd16f5a4dcb1e2643051db8572fee535b6cea1480a9d2f38692a4fd6ac0f6f289a6f295c6646a7b813ac9012cfccc4283349089f78f75419', '2026-04-13 08:43:20', 0, '2026-04-13 08:42:50', '2026-04-13 08:42:50'),
(41, 10, '5a3331381a86ed262b38c13431ff151f29832774b2086e9b7f86f933419d95384bd767895282b6979c0f9e4dde2e632ed7f3274914ce9f928e970a34cca13600', '2026-04-13 10:08:03', 0, '2026-04-13 10:07:34', '2026-04-13 10:07:34'),
(42, 10, '50e870709f44459085937424c6d50d970d2527fd8a89e57f2e34d5e42cc9f1c6328bf8fcc708182e72c12ff038219981d7eae50c2e3dc707a32309e776d1011e', '2026-04-13 10:10:22', 0, '2026-04-13 10:09:52', '2026-04-13 10:09:52'),
(43, 10, '4037c629532e42fa67f86ee61aa75b9b8d797c1a740305b0d33b8c086c1dae7404288f71493f60c722184eabfe7dbf80718508acde9fa0c6571f931eb3b50527', '2026-04-13 10:27:24', 0, '2026-04-13 10:26:55', '2026-04-13 10:26:55'),
(44, 11, '39ed0e9228571bcb98bc9546fd63efe7d5dbcbc220b07b944970eaa490601d32ef3405df8008d887eb720f65adbfcd34f16785991e033e965010803039748381', '2026-04-14 02:39:18', 0, '2026-04-14 02:38:48', '2026-04-14 02:38:48'),
(45, 11, 'd5812b1a5ea162abeb72ce878f7454dcd36329ab943c1f283aec397186337a65c27fe240e43c33f795d8ac20aa0fdb105cba2535800cc510e37aa953fd89482b', '2026-04-14 03:14:13', 0, '2026-04-14 03:13:43', '2026-04-14 03:13:43'),
(46, 11, 'ddcf184b83f82680cb5b86e4d7b862c2474c1e35e5ccfc19aea52944f674629fde9a1240843a125b49856f7ce7d535a8e1ad81ac2306516ec074face6867ed69', '2026-04-14 03:40:59', 0, '2026-04-14 03:40:29', '2026-04-14 03:40:29'),
(47, 11, 'fbeb9a5b5500202d5a175b548e4e54faafecde5d6ac0dfbd55850af802a2512a61e5612c3d41b534bbabaf4c8e242d875ae6a3a89c577e823711c9db96850e5e', '2026-04-14 05:18:28', 0, '2026-04-14 05:17:58', '2026-04-14 05:17:58'),
(48, 11, '605e52149f71b97c9b06b91d440a2727769e4da74b49f1c9911ce76ccc5c1488d33f98d1f27288fe84757a396414e91b310c78c31790bcd6628354a0a55064b2', '2026-04-14 07:17:49', 0, '2026-04-14 07:17:19', '2026-04-14 07:17:19'),
(49, 11, '90390e4cf3613019006010d5bcd7c8f2b431331bac7a41a628b23087d8065b166c0e0d9de07533619ad0a890ec2d4106ed21c184f691400317e27f41977e687d', '2026-04-16 02:56:02', 0, '2026-04-16 02:55:32', '2026-04-16 02:55:32');

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
) ENGINE=MyISAM AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `email`) VALUES
(1, 'admin', '$2y$12$6RDVG7U1b0CmjD/YCUKL9.GoxPOCYNmSsoKDVXa8xPn1d8uq.bCty', 'admin', 'admin@gmail.com'),
(2, 'user1', '$2y$12$4cw3CNUoOgiDxg6LJ7cXRujR/OXsCIR/hbtXvKMFXe5ilMmby6CCS', 'user', 'user1@gmail.com'),
(3, 'user2', '$2y$12$YA1fkGLE.RWapAbZcb1VIOsDF64R.5.1FMNXv70DBjrdsvSdBHJL2', 'user', 'user2@gmail.com'),
(7, 'testuser', '$2y$12$8JnMJLiCUQsRtG0sZYyLBOplt.FLN9wpm855I22jQJJvvo39BV.PW', 'user', 'testuser@gmail.com'),
(8, 'apitest_0407', '$2y$12$POqciYT0d0PKZAsaE7aB7OrmaJviXkKeGZzgCtAY70XJ94EVJiDY2', NULL, 'apitest_0407@example.com'),
(9, 'yenngoc', '$2y$12$QOir7ZkP7LcTpiI26qvWnedLCpSN53OOIdutkw.gFYAz3Z/Ex4Gom', NULL, 'dinhduongyenngoc@gmail.com'),
(10, 'testtoken', '$2y$12$JbHoJ/N9udNqk.k7tWM/sOYgz./tHjJimms83U2s.cqcDaYLVOT6q', NULL, 'abc@gmail.com'),
(11, 'user01', '$2y$12$3Mxq7tNPxxEa9764erkYneR/zVuO9YqLOcnfo3L3oH5wXSj8OfmgC', 'user', 'user01@gmail.com');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_otps`
--

DROP TABLE IF EXISTS `user_otps`;
CREATE TABLE IF NOT EXISTS `user_otps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `otp` varchar(6) NOT NULL,
  `created_at` datetime NOT NULL,
  `expires_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `user_otps`
--

INSERT INTO `user_otps` (`id`, `email`, `otp`, `created_at`, `expires_at`) VALUES
(1, 'abc@gmail.com', '772000', '2026-04-13 08:19:43', '2026-04-13 08:29:43'),
(2, 'abc@gmail.com', '756205', '2026-04-13 08:32:38', '2026-04-13 08:42:38'),
(3, 'abc@gmail.com', '404807', '2026-04-13 10:07:03', '2026-04-13 10:17:03'),
(4, 'abc@gmail.com', '250076', '2026-04-13 10:09:34', '2026-04-13 10:19:34'),
(5, 'abc@gmail.com', '797615', '2026-04-13 10:26:43', '2026-04-13 10:36:43'),
(6, 'user01@gmail.com', '352529', '2026-04-14 02:38:32', '2026-04-14 02:48:32'),
(7, 'user01@gmail.com', '091199', '2026-04-14 03:13:29', '2026-04-14 03:23:29'),
(8, 'user01@gmail.com', '151572', '2026-04-14 03:31:01', '2026-04-14 03:41:01'),
(9, 'user01@gmail.com', '843887', '2026-04-14 03:31:26', '2026-04-14 03:41:26'),
(10, 'user01@gmail.com', '542022', '2026-04-14 03:32:40', '2026-04-14 03:42:40'),
(11, 'user01@gmail.com', '058834', '2026-04-14 03:37:26', '2026-04-14 03:47:26'),
(12, 'user01@gmail.com', '611769', '2026-04-14 03:40:12', '2026-04-14 03:50:12'),
(13, 'user01@gmail.com', '413973', '2026-04-14 05:18:10', '2026-04-14 05:28:10'),
(14, 'user01@gmail.com', '623970', '2026-04-14 07:16:58', '2026-04-17 07:16:58'),
(15, 'user01@gmail.com', '832329', '2026-04-16 02:55:18', '2026-04-19 02:55:18');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_social_accounts`
--

DROP TABLE IF EXISTS `user_social_accounts`;
CREATE TABLE IF NOT EXISTS `user_social_accounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `provider` varchar(50) NOT NULL,
  `provider_user_id` varchar(191) NOT NULL,
  `provider_email` varchar(255) DEFAULT NULL,
  `avatar_url` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_provider_user` (`provider`,`provider_user_id`),
  UNIQUE KEY `uniq_user_provider` (`user_id`,`provider`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_provider` (`provider`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
