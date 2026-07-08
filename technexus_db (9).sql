-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 07, 2026 at 12:59 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `technexus_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `brands`
--

CREATE TABLE `brands` (
  `brand_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `brands`
--

INSERT INTO `brands` (`brand_id`, `name`) VALUES
(8, 'Apple'),
(11, 'ASUS'),
(14, 'Dell'),
(10, 'Google'),
(16, 'JBL'),
(15, 'Logitech'),
(12, 'OnePlus'),
(2, 'Samsung'),
(13, 'Sony'),
(9, 'Xiaomi');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `category_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`category_id`, `name`) VALUES
(6, 'Audio'),
(7, 'Camera'),
(8, 'Gaming Console'),
(2, 'Laptop'),
(9, 'Monitor'),
(1, 'Smartphone'),
(5, 'Smartwatch'),
(4, 'Tablet');

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `item_id` int(11) NOT NULL,
  `description` varchar(255) NOT NULL,
  `cost_price` decimal(10,2) NOT NULL,
  `sell_price` decimal(10,2) NOT NULL,
  `specs` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`specs`)),
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `brand_id` int(11) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `images` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`item_id`, `description`, `cost_price`, `sell_price`, `specs`, `created_at`, `updated_at`, `brand_id`, `category_id`, `images`) VALUES
(1, 'iPhone 15 Promax', 68000.00, 74990.00, '{\"display\":\"6.7-inch Super Retina XDR OLED\",\"processor\":\"A17 Pro chip\",\"camera\":\"48MP Main | 12MP Ultra Wide\",\"battery\":\"4441 mAh\"}', '0000-00-00 00:00:00', '2026-07-06 20:35:29', 8, 1, '[\"images/default-gadget.jpg\", \"images/default-gadget-2.jpg\", \"images/default-gadget-3.jpg\"]'),
(2, 'Samsung Galaxy S24 Ultra (512GB, Titanium Gray)', 72000.00, 84990.00, '{\"display\":\"6.8-inch Dynamic AMOLED 2X\",\"processor\":\"Snapdragon 8 Gen 3\",\"camera\":\"200MP Main | 50MP Periscope\",\"battery\":\"5000 mAh\"}', '0000-00-00 00:00:00', '2026-07-01 09:38:20', 2, 1, '[\"images/default-gadget.jpg\", \"images/default-gadget-2.jpg\", \"images/default-gadget-3.jpg\"]'),
(3, 'Xiaomi 14 Ultra (512GB, Black Leica Edition)', 59000.00, 65999.00, '{\"display\": \"6.73-inch WQHD+ AMOLED\", \"processor\": \"Snapdragon 8 Gen 3\", \"camera\": \"50MP Quad Leica Array\", \"battery\": \"5000 mAh\"}', '0000-00-00 00:00:00', '0000-00-00 00:00:00', NULL, NULL, '[\"images/default-gadget.jpg\", \"images/default-gadget-2.jpg\", \"images/default-gadget-3.jpg\"]'),
(4, 'ASUS ROG Phone 8 Pro (16GB RAM, 512GB Storage)', 54000.00, 60995.00, '{\"display\": \"6.78-inch Flexible AMOLED 165Hz\", \"processor\": \"Snapdragon 8 Gen 3\", \"camera\": \"50MP Main | 32MP Telephoto\", \"battery\": \"5500 mAh\"}', '0000-00-00 00:00:00', '0000-00-00 00:00:00', NULL, NULL, '[\"images/default-gadget.jpg\", \"images/default-gadget-2.jpg\", \"images/default-gadget-3.jpg\"]'),
(5, 'Google Pixel 8 Pro (128GB, Obsidian)', 45000.00, 52990.00, '{\"display\": \"6.7-inch Super Actua Display\", \"processor\": \"Google Tensor G3\", \"camera\": \"50MP Main | 48MP Telephoto\", \"battery\": \"5050 mAh\"}', '0000-00-00 00:00:00', '0000-00-00 00:00:00', NULL, NULL, '[\"images/default-gadget.jpg\", \"images/default-gadget-2.jpg\", \"images/default-gadget-3.jpg\"]'),
(7, 'pink', 500.00, 6999.00, '{\"ram\":\"24gb\"}', '2026-07-01 09:26:45', '2026-07-01 09:28:45', NULL, NULL, '[\"images/default-gadget.jpg\", \"images/default-gadget-2.jpg\", \"images/default-gadget-3.jpg\"]'),
(9, 'as', 44.00, 54.00, '{}', '2026-07-01 11:30:45', '2026-07-01 11:30:45', NULL, NULL, '[\"images/default-gadget.jpg\", \"images/default-gadget-2.jpg\", \"images/default-gadget-3.jpg\"]'),
(10, 'jsnjjsn', 55.00, 6999.00, '{}', '2026-07-01 16:43:38', '2026-07-01 16:43:38', 2, 2, '[\"images/default-gadget.jpg\", \"images/default-gadget-2.jpg\", \"images/default-gadget-3.jpg\"]'),
(11, 'iPhone 15 Pro Max (256GB, Blue Titanium)', 78000.00, 89990.00, '{\"display\":\"6.7-inch Super Retina XDR\",\"processor\":\"A17 Pro\",\"storage\":\"256GB\"}', '2026-07-04 17:17:27', '2026-07-04 17:17:27', 8, 1, '[\"images/default-gadget.jpg\", \"images/default-gadget-2.jpg\", \"images/default-gadget-3.jpg\"]'),
(12, 'Samsung Galaxy Z Fold 6 (512GB)', 95000.00, 109990.00, '{\"display\":\"7.6-inch Foldable AMOLED\",\"ram\":\"12GB\",\"storage\":\"512GB\"}', '2026-07-04 17:17:27', '2026-07-04 17:17:27', 2, 1, '[\"images/default-gadget.jpg\", \"images/default-gadget-2.jpg\", \"images/default-gadget-3.jpg\"]'),
(13, 'Xiaomi Redmi Note 13 Pro (256GB)', 15000.00, 17990.00, '{\"display\":\"6.67-inch AMOLED 120Hz\",\"ram\":\"8GB\",\"storage\":\"256GB\"}', '2026-07-04 17:17:27', '2026-07-04 17:17:27', 9, 1, '[\"images/default-gadget.jpg\", \"images/default-gadget-2.jpg\", \"images/default-gadget-3.jpg\"]'),
(14, 'Google Pixel 9 (128GB, Obsidian)', 42000.00, 48990.00, '{\"display\":\"6.3-inch Actua OLED\",\"processor\":\"Tensor G4\",\"storage\":\"128GB\"}', '2026-07-04 17:17:27', '2026-07-04 17:17:27', 10, 1, '[\"images/default-gadget.jpg\", \"images/default-gadget-2.jpg\", \"images/default-gadget-3.jpg\"]'),
(15, 'OnePlus 12R (256GB, Cool Blue)', 32000.00, 37990.00, '{\"display\":\"6.78-inch AMOLED 120Hz\",\"ram\":\"16GB\",\"storage\":\"256GB\"}', '2026-07-04 17:17:27', '2026-07-04 17:17:27', 12, 1, '[\"images/default-gadget.jpg\", \"images/default-gadget-2.jpg\", \"images/default-gadget-3.jpg\"]'),
(16, 'Dell Inspiron 15 (i5, 8GB RAM, 512GB SSD)', 32000.00, 38990.00, '{\"display\":\"15.6-inch FHD\",\"processor\":\"Intel Core i5-1335U\",\"ram\":\"8GB\"}', '2026-07-04 17:17:27', '2026-07-04 17:17:27', 14, 2, '[\"images/default-gadget.jpg\", \"images/default-gadget-2.jpg\", \"images/default-gadget-3.jpg\"]'),
(17, 'ASUS ROG Zephyrus G14 (Ryzen 9, RTX 4070)', 85000.00, 98990.00, '{\"display\":\"14-inch QHD+ 165Hz\",\"ram\":\"32GB\",\"gpu\":\"RTX 4070\"}', '2026-07-04 17:17:27', '2026-07-04 17:17:27', 11, 2, '[\"images/default-gadget.jpg\", \"images/default-gadget-2.jpg\", \"images/default-gadget-3.jpg\"]'),
(18, 'MacBook Air M3 (13-inch, 256GB)', 62000.00, 71990.00, '{\"display\":\"13.6-inch Liquid Retina\",\"processor\":\"Apple M3\",\"storage\":\"256GB\"}', '2026-07-04 17:17:27', '2026-07-04 17:17:27', 8, 2, '[\"images/default-gadget.jpg\", \"images/default-gadget-2.jpg\", \"images/default-gadget-3.jpg\"]'),
(19, 'iPad Air 11-inch (M2, 128GB)', 38000.00, 44990.00, '{\"display\":\"11-inch Liquid Retina\",\"processor\":\"Apple M2\",\"storage\":\"128GB\"}', '2026-07-04 17:17:27', '2026-07-04 17:17:27', 8, 4, '[\"images/default-gadget.jpg\", \"images/default-gadget-2.jpg\", \"images/default-gadget-3.jpg\"]'),
(20, 'Samsung Galaxy Tab A9+ (64GB)', 12000.00, 14990.00, '{\"display\":\"11-inch TFT LCD\",\"ram\":\"4GB\",\"storage\":\"64GB\"}', '2026-07-04 17:17:27', '2026-07-04 17:17:27', 2, 4, '[\"images/default-gadget.jpg\", \"images/default-gadget-2.jpg\", \"images/default-gadget-3.jpg\"]'),
(21, 'Apple Watch SE (2nd Gen, 44mm)', 13000.00, 15990.00, '{\"display\":\"Retina LTPO OLED\",\"storage\":\"32GB\",\"water_resistance\":\"50m\"}', '2026-07-04 17:17:27', '2026-07-04 17:17:27', 8, 5, '[\"images/default-gadget.jpg\", \"images/default-gadget-2.jpg\", \"images/default-gadget-3.jpg\"]'),
(22, 'Samsung Galaxy Watch 7 (44mm)', 15000.00, 17990.00, '{\"display\":\"Super AMOLED\",\"battery\":\"40 hours\",\"water_resistance\":\"5ATM\"}', '2026-07-04 17:17:27', '2026-07-04 17:17:27', 2, 5, '[\"images/default-gadget.jpg\", \"images/default-gadget-2.jpg\", \"images/default-gadget-3.jpg\"]'),
(23, 'Google Pixel Watch 3', 18000.00, 21990.00, '{\"display\":\"AMOLED\",\"battery\":\"24 hours\",\"water_resistance\":\"5ATM\"}', '2026-07-04 17:17:27', '2026-07-04 17:17:27', 10, 5, '[\"images/default-gadget.jpg\", \"images/default-gadget-2.jpg\", \"images/default-gadget-3.jpg\"]'),
(24, 'JBL Tune 720BT Wireless Headphones', 2800.00, 3490.00, '{\"battery\":\"76 hours\",\"type\":\"Over-ear\",\"connectivity\":\"Bluetooth 5.3\"}', '2026-07-04 17:17:27', '2026-07-04 17:17:27', 16, 6, '[\"images/default-gadget.jpg\", \"images/default-gadget-2.jpg\", \"images/default-gadget-3.jpg\"]'),
(25, 'Sony WF-1000XM5 Wireless Earbuds', 12000.00, 14990.00, '{\"battery\":\"8 hours\",\"noise_cancelling\":\"Yes\",\"type\":\"In-ear\"}', '2026-07-04 17:17:27', '2026-07-04 17:17:27', 13, 6, '[\"images/default-gadget.jpg\", \"images/default-gadget-2.jpg\", \"images/default-gadget-3.jpg\"]'),
(26, 'Logitech Zone Vibe Wireless Headset', 5500.00, 6990.00, '{\"microphone\":\"Noise-cancelling\",\"battery\":\"20 hours\",\"connectivity\":\"Bluetooth/USB\"}', '2026-07-04 17:17:27', '2026-07-04 17:17:27', 15, 6, '[\"images/default-gadget.jpg\", \"images/default-gadget-2.jpg\", \"images/default-gadget-3.jpg\"]'),
(27, 'Sony Alpha a6400 Mirrorless Camera', 55000.00, 63990.00, '{\"sensor\":\"24.2MP APS-C\",\"video\":\"4K30\",\"autofocus\":\"0.02s\"}', '2026-07-04 17:17:27', '2026-07-04 17:17:27', 13, 7, '[\"images/default-gadget.jpg\", \"images/default-gadget-2.jpg\", \"images/default-gadget-3.jpg\"]'),
(28, 'ASUS ROG Ally Handheld Gaming Console', 32000.00, 37990.00, '{\"display\":\"7-inch FHD 120Hz\",\"processor\":\"AMD Z1 Extreme\",\"storage\":\"512GB\"}', '2026-07-04 17:17:27', '2026-07-04 17:17:27', 11, 8, '[\"images/default-gadget.jpg\", \"images/default-gadget-2.jpg\", \"images/default-gadget-3.jpg\"]'),
(29, 'Dell UltraSharp 27 4K Monitor', 24000.00, 28990.00, '{\"resolution\":\"4K UHD 3840x2160\",\"panel\":\"IPS\",\"refresh_rate\":\"60Hz\"}', '2026-07-04 17:17:27', '2026-07-04 17:17:27', 14, 9, '[\"images/default-gadget.jpg\", \"images/default-gadget-2.jpg\", \"images/default-gadget-3.jpg\"]'),
(30, 'Samsung Odyssey Neo G8 32\" Monitor', 45000.00, 52990.00, '{\"resolution\":\"4K UHD\",\"refresh_rate\":\"240Hz\",\"panel\":\"Mini LED\"}', '2026-07-04 17:17:27', '2026-07-05 19:24:28', 2, 9, '[\"images/default-gadget.jpg\", \"images/default-gadget-2.jpg\", \"images/default-gadget-3.jpg\"]');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `order_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `shipping_address` text NOT NULL,
  `status` enum('processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'processing',
  `tracking_number` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `shipped_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`order_id`, `user_id`, `shipping_address`, `status`, `tracking_number`, `created_at`, `updated_at`, `shipped_at`) VALUES
(1, 1, 'aa', 'delivered', 'TCHNXS-933475-K4BGA31G', '2026-06-29 18:58:54', '2026-07-06 20:21:05', NULL),
(3, 10, 'Sitio Sto Nino SMDP', 'cancelled', NULL, '2026-07-02 15:55:15', '2026-07-02 16:00:50', NULL),
(4, 10, 'Sitio Sto Nino SMDP', 'shipped', 'TCHNXS-192532-RC6XB9P0', '2026-07-02 16:12:11', '2026-07-04 03:36:32', NULL),
(5, 10, 'Sitio Sto Nino SMDP', 'shipped', 'TCHNXS-960019-OEBYFOI8', '2026-07-02 16:14:02', '2026-07-04 02:59:20', NULL),
(6, 10, 'Sitio Sto Nino SMDP', 'shipped', NULL, '2026-07-02 16:16:56', '2026-07-04 02:14:49', NULL),
(7, 10, 'Sitio Sto Nino SMDP', 'delivered', NULL, '2026-07-02 17:21:00', '2026-07-03 08:54:24', NULL),
(8, 1, 'hahaha', 'delivered', NULL, '2026-07-03 08:50:22', '2026-07-03 08:54:29', NULL),
(9, 1, 'asjjadhj', 'shipped', NULL, '2026-07-03 08:54:05', '2026-07-04 02:09:55', NULL),
(10, 10, 'Manila', 'shipped', 'TCHNXS-044550-OU4UDNWS', '2026-07-04 03:07:21', '2026-07-04 03:17:24', NULL),
(11, 10, 'Paranaque', 'delivered', 'TCHNXS-499807-5PXO6JJV', '2026-07-04 03:50:51', '2026-07-04 04:15:54', NULL),
(12, 10, 'Paranaque', 'cancelled', NULL, '2026-07-04 04:13:53', '2026-07-04 04:16:25', NULL),
(13, 1, 'Sitio Sto Nino SMDP', 'processing', NULL, '2026-07-04 19:03:27', '2026-07-04 19:03:27', NULL),
(14, 1, 'adasaefqjalfnk', 'delivered', 'TCHNXS-839990-D56VPV2G', '2026-07-07 05:23:11', '2026-07-07 05:24:12', NULL),
(115, 3, 'Taguig', 'shipped', 'TCHNXS-508477-98', '2019-03-16 17:41:47', '2019-03-18 17:41:47', '2019-03-18 17:41:47'),
(116, 1, 'Sitio Sto Nino SMDP', 'shipped', 'TCHNXS-612094-33', '2019-06-08 01:08:52', '2019-06-09 01:08:52', '2019-06-09 01:08:52'),
(117, 7, 'Manila', 'shipped', 'TCHNXS-724027-51', '2019-12-31 02:13:25', '2020-01-03 02:13:25', '2020-01-02 02:13:25'),
(118, 9, 'Davao', 'processing', NULL, '2019-01-05 22:21:07', '2019-01-06 22:21:07', NULL),
(119, 10, 'Paranaque', 'cancelled', NULL, '2019-10-04 18:00:00', '2019-10-05 10:00:00', NULL),
(120, 5, 'Makati', 'delivered', 'TCHNXS-114422-91', '2019-08-15 14:22:00', '2019-08-18 09:00:00', '2019-08-16 11:00:00'),
(121, 1, 'Quezon City', 'cancelled', NULL, '2020-11-11 02:25:46', '2020-11-12 02:25:46', NULL),
(122, 8, 'Taguig', 'shipped', 'TCHNXS-662208-76', '2020-06-05 18:23:50', '2020-06-08 18:23:50', '2020-06-07 18:23:50'),
(123, 4, 'Davao', 'shipped', 'TCHNXS-821817-29', '2020-03-27 03:48:14', '2020-03-30 03:48:14', '2020-03-28 03:48:14'),
(124, 5, 'Quezon City', 'delivered', 'TCHNXS-342095-21', '2020-04-18 09:20:10', '2020-04-20 14:00:00', '2020-04-19 11:00:00'),
(125, 2, 'Cebu', 'delivered', 'TCHNXS-109923-44', '2020-01-15 10:30:00', '2020-01-18 14:00:00', '2020-01-16 11:20:00'),
(126, 6, 'Manila', 'delivered', 'TCHNXS-883341-12', '2020-09-22 16:15:00', '2020-09-25 10:00:00', '2020-09-23 13:45:00'),
(127, 1, 'Davao', 'delivered', 'TCHNXS-413905-18', '2021-05-24 14:15:00', '2021-05-26 16:22:00', '2021-05-25 15:00:00'),
(128, 5, 'Cebu', 'delivered', 'TCHNXS-9904812-32', '2021-07-07 16:40:00', '2021-07-09 18:00:00', '2021-07-08 17:00:00'),
(129, 3, 'Taguig', 'delivered', 'TCHNXS-112233-44', '2021-01-12 09:00:00', '2021-01-15 11:00:00', '2021-01-13 14:00:00'),
(130, 8, 'Makati', 'delivered', 'TCHNXS-554433-22', '2021-08-20 13:10:00', '2021-08-23 16:00:00', '2021-08-21 10:30:00'),
(131, 2, 'Quezon City', 'delivered', 'TCHNXS-998877-66', '2021-11-11 11:11:00', '2021-11-13 15:00:00', '2021-11-12 12:00:00'),
(132, 4, 'Paranaque', 'delivered', 'TCHNXS-776655-44', '2021-04-03 10:20:00', '2021-04-06 09:30:00', '2021-04-04 15:10:00'),
(133, 6, 'Cebu', 'shipped', 'TCHNXS-991204-63', '2022-08-11 16:32:00', '2022-08-14 09:00:00', '2022-08-13 10:00:00'),
(134, 3, 'Davao', 'delivered', 'TCHNXS-341905-56', '2022-12-25 09:00:00', '2022-12-27 12:00:00', '2022-12-26 10:00:00'),
(135, 10, 'Sitio Sto Nino SMDP', 'delivered', 'TCHNXS-123456-78', '2022-02-14 18:25:00', '2022-02-17 11:00:00', '2022-02-15 13:20:00'),
(136, 1, 'Taguig', 'delivered', 'TCHNXS-654321-09', '2022-05-18 10:15:00', '2022-05-20 14:30:00', '2022-05-19 09:00:00'),
(137, 7, 'Manila', 'cancelled', NULL, '2022-10-10 08:00:00', '2022-10-11 10:00:00', NULL),
(138, 9, 'Makati', 'delivered', 'TCHNXS-789012-34', '2022-07-04 15:40:00', '2022-07-07 11:00:00', '2022-07-05 13:00:00'),
(139, 10, 'Davao', 'processing', NULL, '2023-03-30 06:41:07', '2023-04-01 06:41:07', NULL),
(140, 7, 'Manila', 'delivered', 'TCHNXS-519782-45', '2023-01-20 12:44:02', '2023-01-22 12:44:02', '2023-01-21 12:44:02'),
(141, 8, 'Taguig', 'delivered', 'TCHNXS-714029-44', '2023-11-15 08:30:11', '2023-11-17 11:20:00', '2023-11-16 09:45:00'),
(142, 2, 'Paranaque', 'delivered', 'TCHNXS-443322-11', '2023-05-12 14:20:00', '2023-05-15 10:00:00', '2023-05-13 11:30:00'),
(143, 6, 'Quezon City', 'delivered', 'TCHNXS-556677-88', '2023-09-09 09:15:00', '2023-09-11 16:00:00', '2023-09-10 13:00:00'),
(144, 5, 'Manila', 'delivered', 'TCHNXS-889900-11', '2023-07-22 11:00:00', '2023-07-25 14:30:00', '2023-07-23 10:00:00'),
(145, 1, 'Taguig', 'delivered', 'TCHNXS-121314-15', '2023-12-05 16:40:00', '2023-12-08 10:00:00', '2023-12-06 11:15:00'),
(146, 2, 'Sitio Sto Nino SMDP', 'delivered', 'TCHNXS-823154-10', '2024-09-02 11:30:19', '2024-09-04 11:30:19', '2024-09-03 11:30:19'),
(147, 2, 'Makati', 'shipped', 'TCHNXS-159048-81', '2024-03-22 13:14:15', '2024-03-24 15:00:00', '2024-03-23 14:00:00'),
(148, 5, 'Manila', 'delivered', 'TCHNXS-124816-32', '2024-07-19 13:05:44', '2024-07-20 15:30:00', '2024-07-20 11:00:00'),
(149, 8, 'Davao', 'shipped', 'TCHNXS-192837-45', '2024-11-30 18:50:00', '2024-12-01 09:00:00', '2024-12-01 09:00:00'),
(150, 10, 'Sitio Sto Nino SMDP', 'delivered', 'TCHNXS-115599-22', '2024-01-20 10:00:00', '2024-01-22 15:30:00', '2024-01-21 11:00:00'),
(151, 3, 'Manila', 'delivered', 'TCHNXS-334455-66', '2024-05-14 13:25:00', '2024-05-16 10:00:00', '2024-05-15 09:00:00'),
(152, 4, 'Quezon City', 'delivered', 'TCHNXS-778899-00', '2024-10-30 16:15:00', '2024-11-02 11:00:00', '2024-10-31 14:20:00'),
(153, 4, 'Quezon City', 'delivered', 'TCHNXS-714029-44', '2025-04-12 10:00:00', '2025-04-14 11:30:00', '2025-04-13 11:30:00'),
(154, 10, 'Sitio Sto Nino SMDP', 'delivered', 'TCHNXS-109482-11', '2025-09-18 16:45:00', '2025-09-20 14:00:00', '2025-09-19 14:00:00'),
(155, 4, 'Manila', 'delivered', 'TCHNXS-624108-72', '2025-02-12 11:45:00', '2025-02-15 13:00:00', '2025-02-14 10:00:00'),
(156, 1, 'Taguig', 'delivered', 'TCHNXS-990011-22', '2025-01-10 09:15:00', '2025-01-12 14:00:00', '2025-01-11 10:30:00'),
(157, 7, 'Cebu', 'delivered', 'TCHNXS-445566-77', '2025-06-20 15:30:00', '2025-06-22 11:00:00', '2025-06-21 13:00:00'),
(158, 6, 'Quezon City', 'delivered', 'TCHNXS-123789-45', '2025-11-05 10:00:00', '2025-11-07 16:20:00', '2025-11-06 11:00:00'),
(159, 9, 'Davao', 'delivered', 'TCHNXS-774411-99', '2025-08-14 13:10:00', '2025-08-17 09:00:00', '2025-08-15 14:00:00'),
(160, 1, 'Taguig', 'delivered', 'TCHNXS-110022-99', '2026-02-10 14:25:00', '2026-02-12 16:00:00', '2026-02-11 11:00:00'),
(161, 3, 'Manila', 'processing', NULL, '2026-07-06 11:00:00', '2026-07-06 11:00:00', NULL),
(162, 9, 'Davao', 'processing', NULL, '2026-07-01 09:30:00', '2026-07-01 09:30:00', NULL),
(163, 5, 'Makati', 'shipped', 'TCHNXS-994411-23', '2026-07-05 15:00:00', '2026-07-06 10:00:00', '2026-07-06 10:00:00'),
(164, 2, 'Paranaque', 'processing', NULL, '2026-07-07 08:00:00', '2026-07-07 08:00:00', NULL),
(165, 1, 'ASASADSADA', 'shipped', 'TCHNXS-223061-A24YVNCR', '2026-07-07 07:08:34', '2026-07-07 07:10:23', NULL),
(169, 1, 'snka', 'shipped', 'TCHNXS-328966-O43TNB81', '2026-07-07 09:24:13', '2026-07-07 09:25:28', NULL),
(170, 12, 'Davao City Martial Law, 1625', 'processing', NULL, '2026-07-07 10:16:12', '2026-07-07 10:16:12', NULL),
(171, 12, 'Taguig', 'shipped', 'TCHNXS-497997-2JJBK4W8', '2026-07-07 10:16:54', '2026-07-07 10:34:57', NULL),
(172, 1, 'Taguig, 1710', 'processing', NULL, '2026-07-07 10:29:26', '2026-07-07 10:29:26', NULL),
(173, 1, 'Taguig, 1710', 'processing', NULL, '2026-07-07 10:31:22', '2026-07-07 10:31:22', NULL),
(174, 1, 'Taguig, 1710', 'processing', NULL, '2026-07-07 10:33:52', '2026-07-07 10:33:52', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `order_item_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `quantity_ordered` int(11) NOT NULL,
  `price_at_purchase` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`order_item_id`, `order_id`, `item_id`, `quantity_ordered`, `price_at_purchase`) VALUES
(1, 1, 1, 1, 74990.00),
(2, 1, 2, 1, 84990.00),
(5, 3, 1, 3, 74990.00),
(6, 3, 3, 1, 65999.00),
(7, 4, 1, 1, 74990.00),
(8, 4, 7, 1, 6999.00),
(9, 5, 2, 1, 84990.00),
(10, 6, 1, 1, 74990.00),
(11, 7, 1, 1, 74990.00),
(12, 8, 4, 1, 60995.00),
(13, 9, 3, 1, 65999.00),
(14, 9, 10, 1, 6999.00),
(15, 9, 4, 1, 60995.00),
(16, 10, 1, 1, 74990.00),
(17, 10, 9, 1, 54.00),
(18, 10, 3, 1, 65999.00),
(19, 10, 7, 1, 6999.00),
(20, 11, 3, 1, 65999.00),
(21, 12, 5, 1, 52990.00),
(22, 13, 21, 1, 15990.00),
(23, 13, 30, 1, 52990.00),
(24, 14, 30, 4, 52990.00),
(109, 115, 22, 2, 17990.00),
(110, 116, 3, 2, 65999.00),
(111, 117, 15, 2, 37990.00),
(112, 117, 22, 1, 17990.00),
(113, 117, 28, 1, 37990.00),
(114, 118, 1, 2, 74990.00),
(115, 118, 26, 2, 6990.00),
(116, 119, 30, 1, 52990.00),
(117, 120, 1, 1, 74990.00),
(118, 121, 5, 2, 52990.00),
(119, 121, 14, 2, 48990.00),
(120, 121, 19, 2, 44990.00),
(121, 122, 3, 1, 65999.00),
(122, 123, 26, 1, 6990.00),
(123, 123, 2, 2, 84990.00),
(124, 124, 21, 1, 15990.00),
(125, 124, 25, 1, 14990.00),
(126, 124, 10, 1, 6999.00),
(127, 125, 4, 1, 60995.00),
(128, 126, 2, 1, 84990.00),
(129, 127, 17, 1, 98990.00),
(130, 127, 16, 1, 38990.00),
(131, 128, 4, 1, 60995.00),
(132, 129, 5, 1, 52990.00),
(133, 130, 11, 1, 89990.00),
(134, 131, 7, 1, 6999.00),
(135, 132, 18, 1, 71990.00),
(136, 133, 27, 2, 63990.00),
(137, 134, 1, 2, 74990.00),
(138, 135, 3, 1, 65999.00),
(139, 136, 15, 1, 37990.00),
(140, 137, 14, 1, 48990.00),
(141, 138, 12, 1, 109990.00),
(142, 139, 15, 2, 37990.00),
(143, 140, 19, 1, 44990.00),
(144, 141, 18, 2, 71990.00),
(145, 142, 5, 1, 52990.00),
(146, 143, 13, 1, 17990.00),
(147, 144, 18, 1, 71990.00),
(148, 145, 27, 1, 63990.00),
(149, 146, 13, 2, 17990.00),
(150, 146, 2, 1, 84990.00),
(151, 146, 11, 1, 89990.00),
(152, 147, 11, 1, 89990.00),
(153, 148, 27, 1, 63990.00),
(154, 149, 14, 1, 48990.00),
(155, 150, 25, 1, 14990.00),
(156, 151, 24, 1, 3490.00),
(157, 152, 17, 1, 98990.00),
(158, 153, 18, 2, 71990.00),
(159, 154, 30, 2, 52990.00),
(160, 155, 12, 1, 109990.00),
(161, 156, 23, 1, 21990.00),
(162, 157, 16, 1, 38990.00),
(163, 158, 26, 1, 6990.00),
(164, 159, 2, 1, 84990.00),
(165, 160, 2, 1, 84990.00),
(166, 161, 15, 1, 37990.00),
(167, 162, 5, 1, 52990.00),
(168, 163, 21, 1, 15990.00),
(169, 164, 10, 1, 6999.00),
(170, 165, 20, 1, 14990.00),
(175, 169, 27, 2, 63990.00),
(176, 170, 27, 1, 63990.00),
(177, 171, 30, 1, 52990.00),
(178, 172, 11, 1, 89990.00),
(179, 173, 18, 1, 71990.00),
(180, 174, 24, 1, 3490.00);

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `review_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`review_id`, `item_id`, `user_id`, `rating`, `comment`, `created_at`) VALUES
(1, 1, 10, 3, 'Exceeded my expectations! hahahahah', '2026-07-04 18:57:24'),
(3, 3, 10, 3, 'Works perfectly, no complaints.', '2026-07-04 18:57:24'),
(4, 4, 1, 5, 'k', '2026-07-06 19:54:28'),
(5, 2, 1, 5, 'ajjajaja', '2026-07-06 20:22:52');

-- --------------------------------------------------------

--
-- Table structure for table `stocks`
--

CREATE TABLE `stocks` (
  `stock_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stocks`
--

INSERT INTO `stocks` (`stock_id`, `item_id`, `quantity`, `created_at`, `updated_at`) VALUES
(1, 1, 0, '0000-00-00 00:00:00', '2026-07-06 20:35:29'),
(2, 2, 30, '0000-00-00 00:00:00', '2026-07-01 09:38:20'),
(3, 3, 15, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(4, 4, 12, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(5, 5, 8, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(9, 7, 55, '2026-07-01 09:26:45', '2026-07-01 09:28:45'),
(16, 9, 55, '2026-07-01 11:30:45', '2026-07-01 11:30:45'),
(21, 10, 55, '2026-07-01 16:43:38', '2026-07-01 16:43:38'),
(24, 11, 25, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(25, 12, 15, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(26, 13, 40, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(27, 14, 30, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(28, 15, 20, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(29, 16, 18, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(30, 17, 10, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(31, 18, 22, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(32, 19, 28, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(33, 20, 35, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(34, 21, 33, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(35, 22, 27, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(36, 23, 19, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(37, 24, 50, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(38, 25, 24, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(39, 26, 31, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(40, 27, 10, '0000-00-00 00:00:00', '2026-07-07 09:25:28'),
(41, 28, 16, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(42, 29, 14, '0000-00-00 00:00:00', '0000-00-00 00:00:00'),
(43, 30, 8, '0000-00-00 00:00:00', '2026-07-07 10:34:57');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','customer') NOT NULL DEFAULT 'customer',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `addressline` varchar(255) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `zipcode` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `first_name`, `last_name`, `email`, `password`, `role`, `is_active`, `created_at`, `updated_at`, `avatar`, `addressline`, `phone`, `zipcode`) VALUES
(1, 'Jericho', 'Bellen', 'jerichopbellen@gmail.com', '$2b$10$Z/VM/QBcKzcGO6imLBeyWuO2J4.ukSc2eDiiwHhS5SRMl5H7et3A2', 'admin', 1, '2026-06-29 09:50:58', '2026-07-07 10:57:28', '', 'Taguig', '09270820233', '1710'),
(2, NULL, NULL, 'customer1@gmail.com', '$2b$10$mxOyRvjDmlklSKNFl29HEufdQf6I88qwURiKqLQpub.7U3PfMjiPG', 'admin', 0, '2026-06-29 11:21:13', '2026-07-01 15:52:13', NULL, NULL, NULL, NULL),
(3, NULL, NULL, 'pookie@example.com', '$2b$10$nC0uyLmLgGeDfOlnI3tM4upx5UUoZYYnNN0PoMbncAiyJxTC/835G', 'customer', 0, '2026-06-29 19:00:30', '2026-07-06 20:15:49', NULL, NULL, NULL, NULL),
(4, 'Random Local', 'Customer', 'customer5@example.com', '$2b$10$UaesnM62XMSP19nE0lfjXOEdtzOI63jAXDwV8Kie55WIa3KATiM7e', 'customer', 1, '2026-07-01 15:30:59', '2026-07-07 10:01:15', NULL, 'New York, USA', '09994892205', '1630'),
(5, NULL, NULL, 'customer6@example.com', '$2b$10$EJT5XV95yIeu0eAOlfV4zeaYqAezeoOGCiLpJoLb98D8HfdKJHmjK', 'customer', 1, '2026-07-01 15:31:44', '2026-07-01 15:31:44', NULL, NULL, NULL, NULL),
(6, NULL, NULL, 'customer7@example.com', '$2b$10$.gcBVP1h8RqVPZgQ1jNAGeOMGalWe1RX8.OfQWM7DkPOBHfMBL8/e', 'customer', 1, '2026-07-01 15:32:05', '2026-07-01 15:32:05', NULL, NULL, NULL, NULL),
(7, NULL, NULL, 'customer8@example.com', '$2b$10$tVl7bwehmpP9509Y/qSRH.aoXBxiT8GASfnudeV.NJwV1LwP6MqRK', 'customer', 1, '2026-07-01 15:32:26', '2026-07-01 15:32:26', NULL, NULL, NULL, NULL),
(8, NULL, NULL, 'jamzyrinne@gmail.com', '$2b$10$si0u1umlpMRiqUJ2uwZLE.WbZhmiCtHwLYsh10M3bPEDI.WxvgyNm', 'customer', 1, '2026-07-01 20:29:49', '2026-07-01 20:29:49', NULL, NULL, NULL, NULL),
(9, NULL, NULL, 'testuser@gmail.com', '$2b$10$J/L8reWs7Uwl4ZgNYo.2MeTDDBxjOFXiy9VuybzbG3tGpo55nBtOG', 'admin', 0, '2026-07-02 13:55:54', '2026-07-03 14:30:42', NULL, NULL, NULL, NULL),
(10, 'Vince', 'Solana', 'ryosolana@gmail.com', '$2b$10$KlpmBt9rMS.m8WeIZlPlOOJULG9e9b0.RFswz/kmCwQb.U.uO7Ppa', 'customer', 1, '2026-07-02 14:33:03', '2026-07-04 12:08:02', 'images/Screenshot2026-07-01211043-1783002825665-823661277.png', 'Sitio Sto Nino SMDP', '09270820233', '1800'),
(11, 'Customer', '100', 'customer100@example.com', '$2b$10$yidNfDaaVe0gWa2OdoeA2OhA/ou4af1084v2JiP6JDYA7N1H49tqS', 'customer', 1, '2026-07-07 10:03:30', '2026-07-07 10:03:30', NULL, NULL, NULL, NULL),
(12, 'Sara', 'Duterte', 'sara12@example.com', '$2b$10$sbCN4Cg.tSbWwZGZgq9WpOYQvQajoJuFsnE9wI1vXTjW/vaCnn.eK', 'customer', 1, '2026-07-07 10:14:22', '2026-07-07 10:15:30', NULL, 'Davao City Martial Law', '09202558774', '1625');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`brand_id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `name_2` (`name`),
  ADD UNIQUE KEY `name_3` (`name`),
  ADD UNIQUE KEY `name_4` (`name`),
  ADD UNIQUE KEY `name_5` (`name`),
  ADD UNIQUE KEY `name_6` (`name`),
  ADD UNIQUE KEY `name_7` (`name`),
  ADD UNIQUE KEY `name_8` (`name`),
  ADD UNIQUE KEY `name_9` (`name`),
  ADD UNIQUE KEY `name_10` (`name`),
  ADD UNIQUE KEY `name_11` (`name`),
  ADD UNIQUE KEY `name_12` (`name`),
  ADD UNIQUE KEY `name_13` (`name`),
  ADD UNIQUE KEY `name_14` (`name`),
  ADD UNIQUE KEY `name_15` (`name`),
  ADD UNIQUE KEY `name_16` (`name`),
  ADD UNIQUE KEY `name_17` (`name`),
  ADD UNIQUE KEY `name_18` (`name`),
  ADD UNIQUE KEY `name_19` (`name`),
  ADD UNIQUE KEY `name_20` (`name`),
  ADD UNIQUE KEY `name_21` (`name`),
  ADD UNIQUE KEY `name_22` (`name`),
  ADD UNIQUE KEY `name_23` (`name`),
  ADD UNIQUE KEY `name_24` (`name`),
  ADD UNIQUE KEY `name_25` (`name`),
  ADD UNIQUE KEY `name_26` (`name`),
  ADD UNIQUE KEY `name_27` (`name`),
  ADD UNIQUE KEY `name_28` (`name`),
  ADD UNIQUE KEY `name_29` (`name`),
  ADD UNIQUE KEY `name_30` (`name`),
  ADD UNIQUE KEY `name_31` (`name`),
  ADD UNIQUE KEY `name_32` (`name`),
  ADD UNIQUE KEY `name_33` (`name`),
  ADD UNIQUE KEY `name_34` (`name`),
  ADD UNIQUE KEY `name_35` (`name`),
  ADD UNIQUE KEY `name_36` (`name`),
  ADD UNIQUE KEY `name_37` (`name`),
  ADD UNIQUE KEY `name_38` (`name`),
  ADD UNIQUE KEY `name_39` (`name`),
  ADD UNIQUE KEY `name_40` (`name`),
  ADD UNIQUE KEY `name_41` (`name`),
  ADD UNIQUE KEY `name_42` (`name`),
  ADD UNIQUE KEY `name_43` (`name`),
  ADD UNIQUE KEY `name_44` (`name`),
  ADD UNIQUE KEY `name_45` (`name`),
  ADD UNIQUE KEY `name_46` (`name`),
  ADD UNIQUE KEY `name_47` (`name`),
  ADD UNIQUE KEY `name_48` (`name`),
  ADD UNIQUE KEY `name_49` (`name`),
  ADD UNIQUE KEY `name_50` (`name`),
  ADD UNIQUE KEY `name_51` (`name`),
  ADD UNIQUE KEY `name_52` (`name`),
  ADD UNIQUE KEY `name_53` (`name`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`category_id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `name_2` (`name`),
  ADD UNIQUE KEY `name_3` (`name`),
  ADD UNIQUE KEY `name_4` (`name`),
  ADD UNIQUE KEY `name_5` (`name`),
  ADD UNIQUE KEY `name_6` (`name`),
  ADD UNIQUE KEY `name_7` (`name`),
  ADD UNIQUE KEY `name_8` (`name`),
  ADD UNIQUE KEY `name_9` (`name`),
  ADD UNIQUE KEY `name_10` (`name`),
  ADD UNIQUE KEY `name_11` (`name`),
  ADD UNIQUE KEY `name_12` (`name`),
  ADD UNIQUE KEY `name_13` (`name`),
  ADD UNIQUE KEY `name_14` (`name`),
  ADD UNIQUE KEY `name_15` (`name`),
  ADD UNIQUE KEY `name_16` (`name`),
  ADD UNIQUE KEY `name_17` (`name`),
  ADD UNIQUE KEY `name_18` (`name`),
  ADD UNIQUE KEY `name_19` (`name`),
  ADD UNIQUE KEY `name_20` (`name`),
  ADD UNIQUE KEY `name_21` (`name`),
  ADD UNIQUE KEY `name_22` (`name`),
  ADD UNIQUE KEY `name_23` (`name`),
  ADD UNIQUE KEY `name_24` (`name`),
  ADD UNIQUE KEY `name_25` (`name`),
  ADD UNIQUE KEY `name_26` (`name`),
  ADD UNIQUE KEY `name_27` (`name`),
  ADD UNIQUE KEY `name_28` (`name`),
  ADD UNIQUE KEY `name_29` (`name`),
  ADD UNIQUE KEY `name_30` (`name`),
  ADD UNIQUE KEY `name_31` (`name`),
  ADD UNIQUE KEY `name_32` (`name`),
  ADD UNIQUE KEY `name_33` (`name`),
  ADD UNIQUE KEY `name_34` (`name`),
  ADD UNIQUE KEY `name_35` (`name`),
  ADD UNIQUE KEY `name_36` (`name`),
  ADD UNIQUE KEY `name_37` (`name`),
  ADD UNIQUE KEY `name_38` (`name`),
  ADD UNIQUE KEY `name_39` (`name`),
  ADD UNIQUE KEY `name_40` (`name`),
  ADD UNIQUE KEY `name_41` (`name`),
  ADD UNIQUE KEY `name_42` (`name`),
  ADD UNIQUE KEY `name_43` (`name`),
  ADD UNIQUE KEY `name_44` (`name`),
  ADD UNIQUE KEY `name_45` (`name`),
  ADD UNIQUE KEY `name_46` (`name`),
  ADD UNIQUE KEY `name_47` (`name`),
  ADD UNIQUE KEY `name_48` (`name`),
  ADD UNIQUE KEY `name_49` (`name`),
  ADD UNIQUE KEY `name_50` (`name`),
  ADD UNIQUE KEY `name_51` (`name`),
  ADD UNIQUE KEY `name_52` (`name`),
  ADD UNIQUE KEY `name_53` (`name`);

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`item_id`),
  ADD KEY `brand_id` (`brand_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`order_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`order_item_id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `item_id` (`item_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`review_id`),
  ADD UNIQUE KEY `unique_user_item` (`user_id`,`item_id`),
  ADD KEY `fk_reviews_item_id` (`item_id`),
  ADD KEY `fk_reviews_user_id` (`user_id`);

--
-- Indexes for table `stocks`
--
ALTER TABLE `stocks`
  ADD PRIMARY KEY (`stock_id`),
  ADD UNIQUE KEY `unique_item_stock` (`item_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `unique_email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `brands`
--
ALTER TABLE `brands`
  MODIFY `brand_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=175;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `order_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=181;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `review_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `stocks`
--
ALTER TABLE `stocks`
  MODIFY `stock_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `items`
--
ALTER TABLE `items`
  ADD CONSTRAINT `items_ibfk_81` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`brand_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `items_ibfk_82` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_131` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_132` FOREIGN KEY (`item_id`) REFERENCES `items` (`item_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `fk_reviews_item_id` FOREIGN KEY (`item_id`) REFERENCES `items` (`item_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_reviews_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `stocks`
--
ALTER TABLE `stocks`
  ADD CONSTRAINT `stocks_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `items` (`item_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
