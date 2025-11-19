-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 30, 2025 at 09:44 AM
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
-- Database: `vmms`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_log`
--

CREATE TABLE `activity_log` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `action` varchar(50) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` varchar(36) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_log`
--

INSERT INTO `activity_log` (`id`, `user_id`, `action`, `entity_type`, `entity_id`, `ip_address`, `created_at`) VALUES
(1, 1, 'create', 'material', '6ca07c02-5533-45e4-8651-491b48975e78', '127.0.0.1', '2025-10-24 11:43:28'),
(2, 1, 'create', 'material', '4d85bf61-1d67-495a-b3a2-eb2772fd3cf3', '127.0.0.1', '2025-10-24 11:49:45'),
(3, 1, 'create', 'material', '010e1db0-e715-49dd-9be8-4f357b4eba7e', '127.0.0.1', '2025-10-24 11:53:55'),
(4, 1, 'create', 'material', 'd119b8c6-3c9d-4349-ab8b-f63f4fe65e9c', '127.0.0.1', '2025-10-24 12:02:28'),
(5, 1, 'create', 'material', 'ab0876f1-308b-4ca5-816b-61845d9bc9ab', '127.0.0.1', '2025-10-24 12:09:03'),
(6, 1, 'create', 'material', '265a2b5e-736f-4ce5-a321-65f5050c0bf5', '127.0.0.1', '2025-10-24 12:11:04'),
(7, 1, 'create', 'material', 'da815b43-c0fd-4f75-8d32-59698f1166de', '127.0.0.1', '2025-10-25 06:45:57'),
(8, 1, 'create', 'material', '9d9cffb0-278f-4ede-bde3-8f86901bf42d', '127.0.0.1', '2025-10-25 12:04:17'),
(9, 16, 'create', 'material', '42632e4a-ab88-4618-8387-ff2dc184e1a5', '127.0.0.1', '2025-10-25 12:23:09'),
(10, 16, 'approve', 'material', '32527b8e-085d-41c8-aeea-789ce0634768', '127.0.0.1', '2025-10-25 13:03:04'),
(11, 16, 'approve', 'material', '9e68aa43-0616-4cbc-8d9f-1f55ec5cdbbe', '127.0.0.1', '2025-10-25 13:03:52'),
(12, 16, 'approve', 'material', '9d9cffb0-278f-4ede-bde3-8f86901bf42d', '127.0.0.1', '2025-10-25 13:03:52'),
(13, 16, 'approve', 'material', '42632e4a-ab88-4618-8387-ff2dc184e1a5', '127.0.0.1', '2025-10-25 13:03:52'),
(14, 16, 'approve', 'material', '265a2b5e-736f-4ce5-a321-65f5050c0bf5', '127.0.0.1', '2025-10-25 13:03:52'),
(15, 16, 'approve', 'material', 'ab0876f1-308b-4ca5-816b-61845d9bc9ab', '127.0.0.1', '2025-10-25 13:03:52'),
(16, 16, 'approve', 'material', '4d62f924-382e-467b-9e62-1c3dc3de1033', '127.0.0.1', '2025-10-25 13:03:52'),
(17, 16, 'approve', 'material', 'd119b8c6-3c9d-4349-ab8b-f63f4fe65e9c', '127.0.0.1', '2025-10-25 13:03:52'),
(18, 16, 'approve', 'material', 'd7c80c2b-2143-49c3-b608-125cfdc6c37b', '127.0.0.1', '2025-10-25 13:03:52'),
(19, 16, 'approve', 'material', 'da815b43-c0fd-4f75-8d32-59698f1166de', '127.0.0.1', '2025-10-25 13:03:52'),
(20, 16, 'approve', 'material', '4d85bf61-1d67-495a-b3a2-eb2772fd3cf3', '127.0.0.1', '2025-10-25 13:03:52'),
(21, 16, 'approve', 'material', '010e1db0-e715-49dd-9be8-4f357b4eba7e', '127.0.0.1', '2025-10-25 13:03:52'),
(22, 16, 'approve', 'material', '6ca07c02-5533-45e4-8651-491b48975e78', '127.0.0.1', '2025-10-25 13:03:52'),
(23, 16, 'approve', 'material', '26c4e7ea-3476-40d7-81ef-768bc46a00cc', '127.0.0.1', '2025-10-25 13:03:52'),
(24, 16, 'approve', 'material', 'cc6c0568-8d4e-4773-b1eb-3e36c176491e', '127.0.0.1', '2025-10-25 13:03:52'),
(25, 16, 'approve', 'material', '8aba5df4-5480-49fd-b692-62cac93dfe99', '127.0.0.1', '2025-10-25 13:03:52'),
(26, 16, 'approve', 'material', '996cb6e4-c640-4caa-ac6f-5130912c2f52', '127.0.0.1', '2025-10-25 13:03:52'),
(27, 16, 'approve', 'material', '51558c7b-25df-4b6e-95e0-ef6902c3cb5a', '127.0.0.1', '2025-10-25 14:17:32'),
(28, 16, 'approve', 'material', '51558c7b-25df-4b6e-95e0-ef6902c3cb5a', '127.0.0.1', '2025-10-25 14:18:00'),
(29, 16, 'create', 'material', '747df6fa-79ec-4757-91fd-cc452624e818', '127.0.0.1', '2025-10-25 14:20:19'),
(30, 16, 'approve', 'material', '49da4052-6f59-4923-9427-b64b0775acf3', '127.0.0.1', '2025-10-25 14:54:49'),
(31, 1, 'create', 'gust_material', '5befa04a-4ffe-480f-90c3-d3ef6eb0934f', NULL, '2025-10-25 20:20:19'),
(32, 1, 'create', 'gust_material', '97c93346-5585-4589-98c4-8654403a850d', NULL, '2025-10-25 20:22:52'),
(33, 1, 'approve', 'material', '180b3dd4-14ef-4467-950e-73cd6fe54d7c', '127.0.0.1', '2025-10-25 20:27:53'),
(34, 1, 'checkout', 'gust_material', '97c93346-5585-4589-98c4-8654403a850d', NULL, '2025-10-25 20:30:08'),
(35, 1, 'checkin', 'gust_material', '97c93346-5585-4589-98c4-8654403a850d', NULL, '2025-10-25 20:31:57'),
(36, 1, 'checkout', 'gust_material', '97c93346-5585-4589-98c4-8654403a850d', NULL, '2025-10-25 20:36:49'),
(37, 1, 'checkin', 'gust_material', '97c93346-5585-4589-98c4-8654403a850d', NULL, '2025-10-25 20:37:43'),
(38, 1, 'checkout', 'gust_material', '5befa04a-4ffe-480f-90c3-d3ef6eb0934f', NULL, '2025-10-25 21:03:27'),
(39, 1, 'checkin', 'gust_material', '5befa04a-4ffe-480f-90c3-d3ef6eb0934f', NULL, '2025-10-25 21:03:59'),
(40, 1, 'checkout', 'gust_material', '5befa04a-4ffe-480f-90c3-d3ef6eb0934f', NULL, '2025-10-25 21:04:09'),
(41, 1, 'checkout', 'gust_material', '97c93346-5585-4589-98c4-8654403a850d', NULL, '2025-10-25 21:04:35'),
(42, 1, 'create', 'material', '9d2b8250-0e13-48db-8fc3-5859231769b2', '127.0.0.1', '2025-10-26 07:59:37'),
(43, 1, 'checkin', 'gust_material', '97c93346-5585-4589-98c4-8654403a850d', NULL, '2025-10-26 08:22:08'),
(44, 1, 'checkin', 'gust_material', '97c93346-5585-4589-98c4-8654403a850d', NULL, '2025-10-26 08:22:47'),
(45, 1, 'checkin', 'gust_material', '97c93346-5585-4589-98c4-8654403a850d', NULL, '2025-10-26 08:22:52'),
(46, 1, 'checkout', 'gust_material', '97c93346-5585-4589-98c4-8654403a850d', NULL, '2025-10-26 08:23:10'),
(47, 17, 'create', 'material', '0a740ed5-a210-4ee1-b55a-0321d65aa45a', '127.0.0.1', '2025-10-26 08:55:53'),
(48, 17, 'create', 'material', '33f50ee6-0e0a-4575-902a-33ff2ec6b22a', '127.0.0.1', '2025-10-26 08:56:37'),
(49, 17, 'create', 'material', '30813f3d-ec2a-4441-8be4-d60886fac065', '127.0.0.1', '2025-10-26 08:58:32'),
(50, 17, 'approve', 'material', '30813f3d-ec2a-4441-8be4-d60886fac065', '127.0.0.1', '2025-10-26 09:06:47'),
(51, 17, 'approve', 'material', '0a740ed5-a210-4ee1-b55a-0321d65aa45a', '127.0.0.1', '2025-10-26 09:16:12'),
(52, 17, 'reject', 'material', '33f50ee6-0e0a-4575-902a-33ff2ec6b22a', '127.0.0.1', '2025-10-26 09:21:35'),
(57, 1, 'CREATE_TENANT_USER', 'user', '22', NULL, '2025-10-29 10:42:44');

-- --------------------------------------------------------

--
-- Table structure for table `approvals`
--

CREATE TABLE `approvals` (
  `id` int(11) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` varchar(36) NOT NULL,
  `workflow_name` varchar(100) DEFAULT NULL,
  `status` enum('pending','approved','rejected','cancelled') DEFAULT 'pending',
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `requested_by` int(11) NOT NULL,
  `assigned_to` int(11) NOT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `department_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`department_id`, `name`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'IT Park Administration', 'Main administrative department', 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(2, 'Security & Access Control', 'Gate security and access management', 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(3, 'Facilities & Maintenance', 'Building and facilities management', 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(4, 'Reception & Guest Services', 'Front desk and visitor services', 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(5, 'Executive Management', 'Senior leadership team', 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(6, 'Tenant Relations', 'Tenant company liaison', 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(7, 'Technical Support', 'IT and technical services', 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(8, 'Business Development', 'Partnership and growth', 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(9, 'Finance & Accounting', 'Financial operations', 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(10, 'Human Resources', 'HR and staff management', 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `employee_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `fname` varchar(100) DEFAULT NULL,
  `lname` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `sex` enum('M','F') DEFAULT NULL,
  `role_id` int(11) DEFAULT NULL,
  `tenant_id` int(11) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `supervisor_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`employee_id`, `name`, `fname`, `lname`, `email`, `phone`, `sex`, `role_id`, `tenant_id`, `department_id`, `supervisor_id`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Dr. Alemayehu Tadesse', 'Alemayehu', 'Tadesse', 'alemayehu.tadesse@ethiopianitpark.gov.et', '+251-911-123456', 'M', 1, NULL, 5, NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(2, 'Ato Dawit Mekonnen', 'Dawit', 'Mekonnen', 'dawit.mekonnen@ethiopianitpark.gov.et', '+251-911-234567', 'M', 2, NULL, 1, 1, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(3, 'W/ro Hanan Ahmed', 'Hanan', 'Ahmed', 'hanan.ahmed@ethiopianitpark.gov.et', '+251-911-345678', 'F', 2, NULL, 6, 1, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(4, 'Ato Tesfaye Bekele', 'Tesfaye', 'Bekele', 'tesfaye.bekele@ethiopianitpark.gov.et', '+251-911-456789', 'M', 5, NULL, 2, 2, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(5, 'W/ro Meron Haile', 'Meron', 'Haile', 'meron.haile@ethiopianitpark.gov.et', '+251-911-567890', 'F', 5, NULL, 2, 4, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(6, 'Ato Solomon Girma', 'Solomon', 'Girma', 'solomon.girma@ethiopianitpark.gov.et', '+251-911-678901', 'M', 9, NULL, 2, 4, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(7, 'W/ro Tigist Assefa', 'Tigist', 'Assefa', 'tigist.assefa@ethiopianitpark.gov.et', '+251-911-789012', 'F', 6, NULL, 4, 3, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(8, 'W/t Bethlehem Worku', 'Bethlehem', 'Worku', 'bethlehem.worku@ethiopianitpark.gov.et', '+251-911-890123', 'F', 6, NULL, 4, 7, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(9, 'Ato Yohannes Desta', 'Yohannes', 'Desta', 'yohannes.desta@ethiopianitpark.gov.et', '+251-911-901234', 'M', 2, NULL, 7, 2, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(10, 'W/ro Selamawit Teshome', 'Selamawit', 'Teshome', 'selamawit.teshome@ethiopianitpark.gov.et', '+251-911-012345', 'F', 8, NULL, 7, 9, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(11, 'Ato Mulugeta Abebe', 'Mulugeta', 'Abebe', 'mulugeta.abebe@ethiopianitpark.gov.et', '+251-911-123450', 'M', 8, NULL, 3, 2, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(12, 'Ato Getachew Lemma', 'Getachew', 'Lemma', 'getachew.lemma@ethiopianitpark.gov.et', '+251-911-234501', 'M', 8, NULL, 3, 11, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(13, 'W/ro Rahel Negash', 'Rahel', 'Negash', 'rahel.negash@ethiopianitpark.gov.et', '+251-911-345612', 'F', 3, NULL, 8, 1, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(14, 'Ato Biniam Tekle', 'Biniam', 'Tekle', 'biniam.tekle@ethiopianitpark.gov.et', '+251-911-456723', 'M', 3, NULL, 8, 13, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(15, 'W/ro Almaz Wolde', 'Almaz', 'Wolde', 'almaz.wolde@ethiopianitpark.gov.et', '+251-911-567834', 'F', 2, NULL, 9, 1, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(16, 'hayal tamrat', 'hayal', 'tamrat', 'hayal@gmail.co', '09888988989', 'M', 5, NULL, NULL, 1, 1, '2025-10-25 06:53:55', '2025-10-25 06:53:55'),
(17, 'asaye staff', 'asaye', 'staff', 'hayaltamrat@gmail.com', '0913566735', 'M', 9, NULL, 2, NULL, 1, '2025-10-26 08:30:07', '2025-10-26 08:30:07'),
(42, 'Yesuf Fenta', 'Yesuf', 'Fenta', 'yesuf023@gmail.com', '+251923531946', NULL, 3, 34, NULL, NULL, 1, '2025-10-29 10:42:44', '2025-10-29 10:42:44');

-- --------------------------------------------------------

--
-- Table structure for table `materials`
--

CREATE TABLE `materials` (
  `id` varchar(36) NOT NULL,
  `tracking_number` varchar(50) NOT NULL,
  `material_name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `quantity` decimal(10,2) DEFAULT 1.00,
  `unit` varchar(50) DEFAULT 'units',
  `is_returnable` tinyint(1) DEFAULT 0,
  `is_non_returnable` tinyint(1) DEFAULT 0,
  `tenant_id` int(11) DEFAULT NULL,
  `company_name` varchar(200) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `due_time` time DEFAULT NULL,
  `vehicle_plate_no` varchar(50) DEFAULT NULL,
  `requester_name` varchar(200) DEFAULT NULL,
  `requester_phone` varchar(20) DEFAULT NULL,
  `approver_name` varchar(200) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('pending','approved','rejected','in_transit','delivered','cancelled') DEFAULT 'pending',
  `current_location` varchar(255) DEFAULT NULL,
  `destination` varchar(255) DEFAULT NULL,
  `qr_code` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `checked_in` tinyint(1) DEFAULT 0 COMMENT 'Whether material has been checked in (1=yes, 0=no)',
  `checked_out` tinyint(1) DEFAULT 0 COMMENT 'Whether material has been checked out (1=yes, 0=no)',
  `checked_in_at` timestamp NULL DEFAULT NULL COMMENT 'Timestamp when material was checked in',
  `checked_out_at` timestamp NULL DEFAULT NULL COMMENT 'Timestamp when material was checked out',
  `checked_in_by` int(11) DEFAULT NULL COMMENT 'User ID who checked in the material',
  `checked_out_by` int(11) DEFAULT NULL COMMENT 'User ID who checked out the material',
  `gust_id` int(11) DEFAULT NULL COMMENT 'Gust company ID for Gust materials',
  `is_gust_entry` tinyint(1) DEFAULT 0 COMMENT 'Flag to indicate if this is a Gust self-registration (1=yes, 0=no)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `materials`
--

INSERT INTO `materials` (`id`, `tracking_number`, `material_name`, `description`, `category`, `priority`, `quantity`, `unit`, `is_returnable`, `is_non_returnable`, `tenant_id`, `company_name`, `due_date`, `due_time`, `vehicle_plate_no`, `requester_name`, `requester_phone`, `approver_name`, `notes`, `status`, `current_location`, `destination`, `qr_code`, `created_by`, `approved_by`, `approved_at`, `created_at`, `updated_at`, `deleted_at`, `checked_in`, `checked_out`, `checked_in_at`, `checked_out_at`, `checked_in_by`, `checked_out_by`, `gust_id`, `is_gust_entry`) VALUES
('010e1db0-e715-49dd-9be8-4f357b4eba7e', 'MAT-20251024-0007', 'Material Dispense - two', NULL, NULL, 'medium', 77.00, 'items', 0, 0, NULL, 'two', '2025-11-07', '12:53:00', '6568', 'Bereket Tamrat', '0913566735', '21', 'two', 'approved', NULL, NULL, 'data:image/png;base64,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', 1, 16, '2025-10-25 13:03:52', '2025-10-24 11:53:55', '2025-10-25 13:03:52', NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, 0),
('0a740ed5-a210-4ee1-b55a-0321d65aa45a', 'MAT-20251026-10002', 'Material Dispense - hayalt ', NULL, NULL, 'medium', 323.00, 'ds', 0, 0, 5, 'hayalt ', '2025-10-17', '04:55:00', '123', 'hayalt ', '098887786', 'hayalt ', 'hayalt ', 'approved', NULL, NULL, 'data:image/png;base64,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', 17, 17, '2025-10-26 09:16:12', '2025-10-26 08:55:53', '2025-10-26 09:16:12', NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, 0),
('180b3dd4-14ef-4467-950e-73cd6fe54d7c', 'MAT-20251025-31115', 'Material Entry - ewew', NULL, NULL, 'medium', 23.00, 'ew', 0, 0, NULL, 'ewew', '2025-10-30', '16:04:00', '2333', 'Tenant User', 'N/A', NULL, NULL, 'approved', NULL, NULL, 'data:image/png;base64,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', 1, 1, '2025-10-25 20:27:53', '2025-10-25 20:04:23', '2025-10-25 20:27:53', NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, 0),
('265a2b5e-736f-4ce5-a321-65f5050c0bf5', 'MAT-20251024-0010', 'Material Dispense - update the db based on the frontend and update the backend based on the frontend. ', NULL, NULL, 'medium', 141.00, 'items', 0, 0, NULL, 'update the db based on the frontend and update the backend based on the frontend. ', '2025-10-22', '02:11:00', '313', 'Bereket Tamrat', '0913566735', 'update the db based on the frontend and update the backend based on the frontend. ', 'update the db based on the frontend and update the backend based on the frontend. ', 'approved', NULL, NULL, 'data:image/png;base64,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', 1, 16, '2025-10-25 13:03:52', '2025-10-24 12:11:04', '2025-10-25 13:03:52', NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, 0),
('26c4e7ea-3476-40d7-81ef-768bc46a00cc', 'MAT-20251024-0004', 'Material Dispense - test', NULL, NULL, 'medium', 1.00, 'units', 0, 0, NULL, 'test', '2025-10-31', '02:11:00', '123', '@MaterialRegistration.jsx ', '0913566735', '@MaterialRegistration.jsx ', '@MaterialRegistration.jsx ', 'approved', NULL, NULL, 'data:image/png;base64,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', 1, 16, '2025-10-25 13:03:52', '2025-10-24 11:40:28', '2025-10-25 13:03:52', NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, 0),
('30813f3d-ec2a-4441-8be4-d60886fac065', 'MAT-20251026-10004', 'Material Dispense - hayalt ', NULL, NULL, 'medium', 323.00, 'ds', 0, 0, 5, 'hayalt ', '2025-10-17', '04:55:00', '123', 'hayalt ', '098887786', 'hayalt ', 'hayalt ', 'approved', NULL, NULL, 'data:image/png;base64,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', 17, 17, '2025-10-26 09:06:47', '2025-10-26 08:58:32', '2025-10-26 09:06:47', NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, 0),
('32527b8e-085d-41c8-aeea-789ce0634768', 'MAT-20251025-0031', 'Material Entry - qr', NULL, NULL, 'medium', 32.00, 'qr', 0, 0, NULL, 'qr', '2025-10-31', '07:53:00', '234', 'Tenant User', 'N/A', NULL, NULL, 'approved', NULL, NULL, 'data:image/png;base64,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', 1, 16, '2025-10-25 13:03:04', '2025-10-25 10:53:57', '2025-10-25 13:03:04', NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, 0),
('33f50ee6-0e0a-4575-902a-33ff2ec6b22a', 'MAT-20251026-10003', 'Material Dispense - hayalt ', NULL, NULL, 'medium', 323.00, 'ds', 0, 0, 5, 'hayalt ', '2025-10-17', '04:55:00', '123', 'hayalt ', '098887786', 'hayalt ', 'hayalt ', 'rejected', NULL, NULL, 'data:image/png;base64,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', 17, 17, '2025-10-26 09:21:34', '2025-10-26 08:56:37', '2025-10-26 09:21:34', NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, 0);
INSERT INTO `materials` (`id`, `tracking_number`, `material_name`, `description`, `category`, `priority`, `quantity`, `unit`, `is_returnable`, `is_non_returnable`, `tenant_id`, `company_name`, `due_date`, `due_time`, `vehicle_plate_no`, `requester_name`, `requester_phone`, `approver_name`, `notes`, `status`, `current_location`, `destination`, `qr_code`, `created_by`, `approved_by`, `approved_at`, `created_at`, `updated_at`, `deleted_at`, `checked_in`, `checked_out`, `checked_in_at`, `checked_out_at`, `checked_in_by`, `checked_out_by`, `gust_id`, `is_gust_entry`) VALUES
('42632e4a-ab88-4618-8387-ff2dc184e1a5', 'MAT-20251025-3111', 'Material Dispense - test', NULL, NULL, 'medium', 321.00, 'kp', 0, 0, 5, 'test', '2025-10-31', '00:26:00', '123', 'Beki Tame', '0913566735', 'abeba', 'test', 'approved', NULL, NULL, 'data:image/png;base64,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', 16, 16, '2025-10-25 13:03:52', '2025-10-25 12:23:09', '2025-10-25 13:03:52', NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, 0),
('4705cd04-06f5-4f0d-b1ea-de7cb2ab4016', 'MAT-20251025-31112', 'Material Entry - test', NULL, NULL, 'medium', 266.00, 'items', 0, 0, NULL, 'test', '2025-10-31', '11:58:00', '1253', 'Tenant User', 'N/A', NULL, NULL, 'pending', NULL, NULL, NULL, 16, NULL, NULL, '2025-10-25 14:10:42', '2025-10-25 14:10:42', NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, 0),
('49da4052-6f59-4923-9427-b64b0775acf3', 'MAT-20251025-31114', 'Material Entry - dspense', NULL, NULL, 'medium', 423.00, 'gd', 0, 0, NULL, 'dspense', '2025-10-30', '10:24:00', '321', 'Tenant User', 'N/A', NULL, NULL, 'approved', NULL, NULL, 'data:image/png;base64,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', 16, 16, '2025-10-25 14:54:49', '2025-10-25 14:21:47', '2025-10-26 08:24:05', NULL, 1, 0, '2025-10-26 08:24:05', NULL, 1, NULL, NULL, 0),
('4d62f924-382e-467b-9e62-1c3dc3de1033', 'MAT-20251025-0003', 'Material Entry - nathan', NULL, NULL, 'medium', 221.00, 'reww', 0, 0, NULL, 'nathan', '2025-10-31', '09:44:00', '9901', 'Tenant User', 'N/A', NULL, NULL, 'approved', NULL, NULL, NULL, 1, 16, '2025-10-25 13:03:52', '2025-10-25 10:46:42', '2025-10-25 13:03:52', NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, 0),
('4d85bf61-1d67-495a-b3a2-eb2772fd3cf3', 'MAT-20251024-0006', 'Material Dispense - one', NULL, NULL, 'medium', 154.00, 'items', 0, 0, NULL, 'one', '2025-10-30', NULL, '121', 'two', '0913566735', 'two', 'two', 'approved', NULL, NULL, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAAklEQVR4AewaftIAAAu1SURBVO3BUW4YSbIgQfcC739lX/0QCDRe5rBESt0LhJn9wlrr//Sw1jp6WGsdPay1jj74B5W/qWJSuak4UbmpeENlqnhD5aZiUvlUMam8UfEdKj+l4kZlqphU/qaKTw9rraOHtdbRw1rr6IP/oeInqXyHyknFpHKjclPxhsp3VHxSeaNiUnmjYqqYVKaKSeVE5SdV/CSVk4e11tHDWuvoYa119MFLKm9U/KSKSeWrVKaKSeXfpPKp4g2Vn6TyRsWk8qliUvlJKm9UfNXDWuvoYa119LDWOvrgP6ZiUplUTlSmijcqblTeqPhTVKaKN1QmlaniRmWq+F0V/1UPa62jh7XW0cNa6+iD/xiVqeJG5atUpopJ5Y2KSWVS+V0q36FyUzGpTCpTxY3KVHFS8f+Lh7XW0cNa6+hhrXX0wUsVf1LF76q4qZhUbipuVKaKG5Wp4qtUblSmihuVqWJSuamYVCaVk4qfVPGnPKy1jh7WWkcPa62jD/4Hlb9JZaqYVKaKTypTxaQyVUwqNypTxaQyVbyh8qnipmJSuVGZKiaVqWJSmSpuKj6p3KhMFTcqf8vDWuvoYa119LDWOrJf+A9TmSomlU8VNypvVNyofEfFV6m8UXGjMlVMKjcVX6XyRsV/xcNa6+hhrXX0sNY6sl8YVKaKG5X/qooblZuKG5V/S8WkclPxhspNxaRyUjGpvFFxozJVTCpvVHx6WGsdPay1jh7WWkf2C4PKVDGp3FRMKlPFpDJV3Kj8roo3VKaKSWWq+A6VTxWTylRxo/JGxY3KVPFVKt9R8W95WGsdPay1jh7WWkf2C9+gMlVMKn9LxaQyVfxNKlPFpPJVFTcqNxU3Kn9KxaQyVUwqU8WNyk3FpHJT8elhrXX0sNY6elhrHX3wDypTxaTyRsWNylRxo/JVFTcq31ExqdyoTBWTylepTBU3KlPFTcWNylTxu1SmiknlpmJSmVRuKk4e1lpHD2utow9eqphUJpU3KiaVm4pJ5ZPKVDGp3FTcqEwqf0rFpHKj8pNU3lD5Wyp+kspU8elhrXX0sNY6elhrHX3wDxWTylRxU/E3VXxSmVSmihuVNypuVP6UihuVqWJSmSomlZuKP0XlRmWqmComlaniqx7WWkcPa62jh7XW0Qf/oDJV3FRMKlPFpPJGxY3Kp4oblanijYpJ5Y2KSeVE5Q2VG5U3Kr5D5VPFpPJGxaRyo/KGylTx6WGtdfSw1jp6WGsd2S/8h6lMFScqU8WNylQxqbxRMalMFZPKVHGiMlVMKjcVNypTxY3KVHGiMlVMKt9RMalMFZPKVHHysNY6elhrHT2stY4++AeVm4pJZaqYVG4qvkPlU8WkMlVMFTcVk8pUMam8UTGpfKqYKiaVqeI7Kn6SyonKTcUbKn/Kw1rr6GGtdfSw1jqyX7hQuan4SSq/q2JSmSreUPmTKiaVP6XiO1Smikllqvik8pMqJpWpYlK5qTh5WGsdPay1jh7WWkf2CxcqU8WkMlVMKm9UTCpTxaTyuyomlaniRuWmYlKZKiaV31UxqdxU3Ki8UTGpfFXFGypvVPyuh7XW0cNa6+hhrXX0wT+oTBWTylQxqUwVb6hMFZPKVPFJ5aZiUpkqJpWbihuVqWJSmSo+qdxUTCp/UsWNylRxovKGyk3FpPJTHtZaRw9rraOHtdbRB/+Dyo3KVDGp3FTcqHxVxaQyqbxRcaMyVbxRMamcVNxU/Ekqv0vlJ1X8JJWp4tPDWuvoYa119LDWOrJf+INUpopJZar4XSpTxaQyVUwqNxXfoTJVTCqfKiaVqeINlaliUnmjYlL5KRVvqNxU/K6HtdbRw1rr6GGtdWS/MKhMFZPK31QxqZxUvKFyU/GGylQxqfwtFTcqP6nid6n8pIoblani5GGtdfSw1jp6WGsdffAPFZPKTcWkMlW8ofJGxSeVqWJSmSp+UsUbFV+lMlXcqEwVU8WkMlVMKn9LxRsqk8obKlPFp4e11tHDWuvoYa119MFfpjJV3Kh8VcVNxaRyUzGpTBU3Km+ofKp4Q2WqmFSmihuVqWJSmVSmihOVN1SmijcqJpWp4uRhrXX0sNY6+uAfVP6kin+LyhsqU8WkclMxqdxUfJXKjcrfVHGiMlVMKjcVb1T8lIe11tHDWuvoYa119MH/UHGjcqPyt6hMFVPFpPJvUvldFd+hMlW8UTGpfJXKjcpPUpkqJpWp4tPDWuvoYa119LDWOrJfeEFlqphUpooblaliUpkqJpWvqrhRmSreUJkqblROKv5LVG4qforKVDGp/EkVnx7WWkcPa62jh7XW0Qd/mMpNxaTyuyomlUllqpgqJpXvULmpmFQ+qdxU3KhMFZPKT1KZKj6p3FS8UTGp/CkPa62jh7XW0cNa68h+YVCZKm5UporvUJkqforKT6q4UbmpOFH5jooblaliUpkqJpWpYlL5VPGGyndU/JSHtdbRw1rr6GGtdWS/cKFyUzGp/E0Vf4vKVDGp3FR8lcqfVDGp3FRMKn9KxaRyUzGpTBU3KlPFp4e11tHDWuvoYa119ME/qEwVNypTxXeo3FRMKicVb6hMFTcqNxU3Kl9VMalMFTcqk8pUcaNyUzGpnFRMKm9UvKHyux7WWkcPa62jh7XW0QcvqdyoTBWTyneoTBWfVCaVqWJSeaPiDZWbiknlU8WkcqMyVfykiknlqyomlaniDZWp4o2Kr3pYax09rLWOHtZaR/YLFyo3FZPKTcWNylQxqUwVv0vljYpJZap4Q+WnVEwqNxWTyk3FpDJV/FeoTBU3KlPFp4e11tHDWuvoYa11ZL/wgspU8YbKVHGjclPxVSpvVHyHylQxqfyUiknlpuInqZxUfIfKTcWf8rDWOnpYax09rLWO7BcGlaniDZWp4g2VqWJSOamYVG4qJpU3KiaVqeJGZao4UZkqJpU3Km5Ubiomlanik8pNxaQyVUwqf1LFp4e11tHDWuvoYa119MFLKlPFjcobFb9L5aZiUvkOlaliUvldKm9U3KjcqPxbVKaKSWWquFGZKm5UTh7WWkcPa62jh7XW0Qf/UDGpvFHxHSpTxU3FV6n8SSpTxaRyo3JS8ZNUpop/S8WkMlVMKj+p4uRhrXX0sNY6sl+4UJkq3lC5qfgOlU8Vk8pUcaMyVdyo3FRMKlPFV6ncVLyhclNxo/KnVEwqb1RMKjcVJw9rraOHtdbRw1rryH7hQuWNijdUporfpTJVTCo3Fd+h8kbFpPKnVLyh8kbFicpNxaQyVdyofEfFycNa6+hhrXX0sNY6+uAfVN6oeEPlO1SmihOVqWJS+UkVk8qNyu+quFG5UXmjYlKZVE4qJpVJ5Ubl3/Kw1jp6WGsdPay1jj74h4o/qeJG5aZiUjmpmFTeUHmj4o2Kr1KZVKaKqWJSmSomlRuVm4pJ5XdVvKEyVdyofNXDWuvoYa119LDWOvrgH1T+porvqPikMqn8SRWTyneofKq4qZhUbiomlZuKN1T+FJWp4kblpmJSmSo+Pay1jh7WWkcPa62jD/6Hip+k8kbFpDJVfKp4Q2VSuam4qbhRuan4KpWbikllqvhJFZPKScWkclPxRsWNylRx8rDWOnpYax09rLWOPnhJ5Y2Kv0XljYpJ5UblpmJSuVH5WyomlaliUrmpmFR+isp3qEwVU8WkMlV8elhrHT2stY4e1lpHH/x/TuVTxaQyVUwqU8WNyhsVNypTxYnKGypTxVQxqdxU/C6Vm4pJZaqYVKaKP+VhrXX0sNY6elhrHX3wH1MxqXyVyp9U8R0qNyqfKqaKG5XvqJhUvqPik8pUcVMxqdyo3FT8roe11tHDWuvoYa119MFLFf+miknlU8WkMqncqEwVNyo3FVPFjcqfojJVTCo3KlPFjcqnihuVqWKqmFSmijdUvuphrXX0sNY6elhrHX3wP6j8TSpTxe+qmFSmiknl31TxSWWquKmYVKaKn6TyVSpTxY3KGypTxU3FpHLysNY6elhrHT2stY7sF9Za/6eHtdbRw1rr6P8B4Jl+R6wKGPoAAAAASUVORK5CYII=', 1, 16, '2025-10-25 13:03:52', '2025-10-24 11:49:45', '2025-10-25 13:03:52', NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, 0),
('51558c7b-25df-4b6e-95e0-ef6902c3cb5a', 'MAT-20251025-31113', 'Material Entry - test', NULL, NULL, 'medium', 266.00, 'items', 0, 0, NULL, 'test', '2025-10-31', '11:58:00', '1253', 'Tenant User', 'N/A', NULL, NULL, 'approved', NULL, NULL, 'data:image/png;base64,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', 16, 16, '2025-10-25 14:18:00', '2025-10-25 14:13:46', '2025-10-25 14:18:00', NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, 0),
('5befa04a-4ffe-480f-90c3-d3ef6eb0934f', 'GUST-20251025-0001', 'Gust Material Entry - qw', NULL, NULL, 'medium', 323.00, 'ew', 0, 0, NULL, 'qw', '2025-10-25', '16:11:00', '3212', 'Gust User', 'N/A', NULL, NULL, 'approved', NULL, NULL, 'data:image/png;base64,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', 1, 1, '2025-10-26 00:20:19', '2025-10-25 20:20:19', '2025-10-25 21:04:09', NULL, 1, 1, '2025-10-26 00:20:19', '2025-10-25 21:04:09', 1, 1, NULL, 1),
('6ca07c02-5533-45e4-8651-491b48975e78', 'MAT-20251024-0005', 'Material Dispense - one', NULL, NULL, 'medium', 1.00, 'units', 0, 0, NULL, 'one', '2025-10-25', '22:44:00', '6656', 'Yeamlak Tamrat', '0913566735', 'one', NULL, 'approved', NULL, NULL, 'data:image/png;base64,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', 1, 16, '2025-10-25 13:03:52', '2025-10-24 11:43:28', '2025-10-25 13:03:52', NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, 0),
('747df6fa-79ec-4757-91fd-cc452624e818', 'MAT-20251025-10000', 'Material Dispense - dspense', NULL, NULL, 'medium', 32.00, 'hd', 0, 0, 4, 'dspense', '2025-10-30', '11:19:00', '1231', 'Beki Tame', '0913566735', 'dspense', 'dspense', 'pending', NULL, NULL, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAAklEQVR4AewaftIAABH/SURBVO3BgYpcR5AAwcxh//+X8yRwgRD13J65lX0HHWE/cF3X6sV1XY9eXNf16ItfqHy3ihOVTcVQ2VRsVEbFRmVTMVROKobKpmKonFQMlU3Ficqo+JTKqHiHyqbiRGVUbFS+W8VPL67revTiuq5H9gN/URkVn1IZFe9QGRXvUHlHxVB5R8WfpPKOio3KpmKobCqGyqj4lMpJxUZlVAyVUfEplVHx04vruh69uK7r0Rf/gMpJxYnKqHiHyqjYVJyoDJVNxVDZqHyqYqMyKt6hMipGxVAZKicqJyqjYqhsKobKqBgqo+JTKicVf+fFdV2PXlzX9eiL/wNUTio2KqNio7KpOKnYqJxUvKNio7KpGBVDZVSMio3KqBgqG5VRsanYqGxUNiqj4t/24rquRy+u63r0xf8BFUNlqIyKofKpiqGyqRgqm4qhslEZFUPlUxVDZVPxKZVRMVRGxUZlU7GpGCqjYqMyKv4NL67revTiuq5HX/wDFX+Syqcq3qGyqRgqm4qhMipOVDYVJyqbio3KpmKojIqhsqkYKqNiVAyVT6mMilHxjor/rRfXdT16cV3Xoy8eqPwXKobKO1RGxaZiqJxUDJVRMVRGxVAZFUNlozIqTlRGxaZiqIyKoTIqhsqoOFEZFUNlVAyVUTFUNiqjYqPynV5c1/XoxXVdj774RcV/TWWjMiqGyknFd1MZFUNlVAyVk4oTlVGxqRgqo2KojIpNxVDZqGxURsVQGRUnKqNiU/GnvLiu69GL67oe2Q/8RWVUDJVPVZyojIqhsqkYKicVQ+UdFe9Q+ZMqNiqjYqMyKobKqBgqm4p3qIyKobKpeIfKpyr+zovruh69uK7r0RcPVEbFUNlUbFRGxaZiqIyKoTJURsVQGRVDZVMxVEbFUPmTKobKpmKjcqIyKt5RMVQ2KpuKUbGp2KiMiqHyHSo2KqPipxfXdT16cV3XI/uBv6iMiqEyKobKpyo2KpuKE5VNxVA5qdiobCpOVDYVJyqj4kRlVLxDZVMxVEbFUDmpGCqbiqEyKt6hMio2KpuKn15c1/XoxXVdj774RcVQeUfFRmVUDJVNxTtURsVQGSqbiqGyURkVQ2WjsqnYqGwqNiqbilExVEbFUDmpGCqj4h0VJxVDZaMyKobKqDhR2VT87sV1XY9eXNf16It/oGKonKi8o2KovKNiqIyKoXJS8R0qhspGZVQMlaFyUjFURsWoGCqjYqhsVN5RcaLyqYpNxVAZFZuKoTJURsVPL67revTiuq5H9gN/UfkOFUNlVGxURsVGZVQMlVExVEbFicqoGCqjYqh8t4oTlU9VnKiMiqEyKobKpmKjMiqGyjsqTlQ2FUNlU/HTi+u6Hr24ruvRF/9AxUZlVAyVjcqoGBVDZVMxVDYqG5VNxag4URkVQ2VUbFTeobKpOFHZqIyKofInqWxUTio2KpuKUTFUNhVD5Xcvrut69OK6rkdf/KJiqAyVTcVQGRVD5VMVQ2VUbFQ2Fe9Q2VQMlVHxX1AZFScVm4qhMlRGxXerGConKqNio3Kisqn43Yvruh69uK7rkf3AX1RGxUZlVGxU3lGxUTmpGCrvqNionFQMlU3FUBkVQ+WkYqiMiqEyKobKOyqGyqj4DirvqNiojIpPqWwqfnpxXdejF9d1PfriFxWfUhkVQ2VUnKhsKjYqo+JEZaicVLyjYqiMiqGyqdiobFRGxVDZVJyojIqh8t0qhsqo2KicqGwqhsqoGCq/e3Fd16MX13U9sh/4i8qmYqMyKobKpmKjMio2KqNio7KpeIfKOyreoTIqNirvqNiojIqhclKxURkVQ2VUDJVRMVTeUTFUNhUblVExVDYVP724ruvRi+u6HtkPLFRGxUZlVGxURsWJyqjYqIyKjcpJxUZlVGxURsWnVEbFUBkVG5WTihOVk4oTlVFxojIqNiqj4h0qm4p/6sV1XY9eXNf1yH5gofJfqNiojIqNyqgYKqNiqIyKjcqmYqicVAyVk4rvpnJSMVRGxYnKqNiofLeKoTIqhsqm4u+8uK7r0Yvruh7ZDxyobCqGyqj4k1Q2FUNlVAyV71ZxonJSMVQ2FUPlpGKjMio2KicVQ2VUDJVNxVAZFRuVUTFUTiqGyqgYKqPipxfXdT16cV3Xoy9+oTIqRsVQGSoble9QsakYKpuKk4qhclJxovLdKobKpmKjsqk4qdiovKNiqGwqhsqm4qRiqAyVUTFURsXvXlzX9ejFdV2PvvhFxUnFO1RGxUZlVGxURsVGZVScqIyKjcpGZVRsKt6hMio2FScq30FlVIyKoTIqTiqGyqZiqGxU3lFxojIqfnpxXdejF9d1PbIfOFAZFUNlVAyVUTFU3lExVE4qNiqbiqEyKobKqNiojIqh8qmKjcqm4lMqo+JTKpuKoTIqhsqm4juonFT87sV1XY9eXNf1yH7gLyqjYqhsKobKqDhR2VQMlVGxURkVQ2VTMVROKobKpmKojIqNyqZiqPxbKjYqo2KjsqkYKicVJyqjYqiMiqEyKobKqBgqo+KnF9d1PXpxXdejL/6BineobCpGxUZlVAyVUbFROVH5kyqGyknFUBkVQ2VUvENlVLyjYqNyonJSMVRGxVAZFUNlVHxKZVT87sV1XY9eXNf1yH7gD1L5DhVD5aTiRGVUbFRGxVAZFZ9SOakYKqNiqGwqhsqo2KicVJyojIqh8o6KE5VR8Z1eXNf16MV1XY/sBw5UvkPFUDmp2KiMihOVT1UMlZOKjcqo2KhsKjYqm4qhMiqGyqZiozIqNiqj4lMqm4p3qIyKoTIqhsqo+OnFdV2PXlzX9ch+YKEyKobKqPi3qLyjYqi8o2KjsqkYKqNio7KpGCrvqBgqJxUblXdUDJWTiu+mMiqGyqjYqIyK3724ruvRi+u6HtkPfEjlO1QMlVExVEbFRuU7VJyobCpOVL5DxUZlVJyobCqGyqgYKpuKjcqoGCqjYqPyqYpPvLiu69GL67oeffFA5R0VJyonFZuKoTIqNhWfUtlUbCqGyqg4qThReUfFRuU7qLxDZaOyUTmpOFHZqGwqfvfiuq5HL67revTFL1RGxYnKRmVUbCo+VTFURsVQGRUnKqNiozIqhsp3UBkVm4qhMiqGyqZiqGwqNhVD5R0VG5WTiqGyURkVJxVD5e+8uK7r0Yvruh598Q+ojIqTihOVTcVQ2VScVAyVTcVGZVRsVEbFUBkqo+Kk4kRlo/Kpik9VDJWNyqZiqIyKoXJS8Q6VUfF3XlzX9ejFdV2P7AcOVP6kihOVUTFUTireobKp2KhsKjYq36FiqIyKE5VRsVEZFUNlVAyVUbFReUfFUPlUxUZlU/HTi+u6Hr24ruvRF79Q2VQMlVExVEbFUBkVQ+VEZVQMlU3FUBkqo2KjMiqGylAZFaNiqGxUNhVDZVOxUfkOKpuKofIOlZOKjcpQOanYqGxURsXfeXFd16MX13U9sh/4i8qmYqMyKobKScVQGRVDZVOxURkVG5VNxYnKqPhuKicVJyqjYqhsKjYqJxUblU3FUBkVJyqj4juobCp+enFd16MX13U9sh/4i8o7KobKqHiHyqjYqIyK76ByUvEOlU3FRmVUvENlU3GiclIxVEbFRmVTMVRGxVA5qThR2VR84sV1XY9eXNf16ItfVJyobCqGyjsqPqUyKr5DxVAZFUNlVIyKjcqJyknFpmKonFR8SmVUbCqGyqjYVLxDZVPxDpVNxU8vrut69OK6rkf2A39RGRVD5aRiozIqNiqj4kRlVAyVUXGi8h0qNiqjYqOyqRgqo2KojIqNyqjYqLyjYqhsKk5U/i0VQ2VU/J0X13U9enFd16MvflGxqRgqo2KjMireoTIq/gsVG5VRMVQ2FScVQ2VTsakYKpuKoTIqRsVGZVScVGxURsWo2KiMio3KpuKkYqiMit+9uK7r0Yvruh598QuVUXGiMipGxUZlVGwqNiqjYqiMiqGyqThRGRWjYqicqIyKjcqoGCqjYqOyqRgqo2KonFQMlVGxURkVo+I7qGwqhsqmYqj8Uy+u63r04rquR1/8ouKkYqgMlZOKd6iMihOVUbFR+bdUDJVRcVKxUdlUDJWNyqZiozIqhsqJyqZiozIqTiqGyqg4qRgqQ2VU/PTiuq5HL67remQ/8BeVUXGisqkYKicVQ+VTFRuVUXGiclIxVE4qhsqm4h0qm4qhsqk4UdlUDJVPVZyonFRsVN5R8bsX13U9enFd1yP7gW+mclIxVEbFp1RGxTtUNhUblZOKT6lsKjYqo2KjMiqGyqgYKpuKoTIqhso7Kk5URsVGZVMxVDYVv3txXdejF9d1PfriFyrvqBgqo2KonFQMlVExVEbFd1AZFScqo2KjMlQ2FRuVUXGislHZVGwqhsqoGConKu+o2KiMilHxjor/rRfXdT16cV3XI/uBhcpJxVDZVAyVUTFURsVQGRVDZVQMlVExVEbFRmVU/H+gMio2KicVn1J5R8WJyqjYqHyqYqhsKn56cV3XoxfXdT364kHFRuWkYlMxVEbFpuJEZVQMlVGxURkVQ2VUDJVRsVE5qRgqn6oYKpuKofIOlZOKoTIqhspQGRXvUBkVG5VNxVDZVPzuxXVdj15c1/Xoi1+ojIqhMiqGyqgYKqNiqGxUTipGxadURsVQeYfKqBgVn6r4DhVDZVMxVEbFpmKjMio2FRuVE5VRMVRGxagYKpuKf+rFdV2PXlzX9ch+YKEyKobKqBgqo2KojIqNyneo+JTKv6ViqGwqhspJxVDZVJyojIqh8o6KoTIqNiqj4k9S2VT87sV1XY9eXNf1yH7gLyonFUPlT6oYKpuKE5VNxUZlVGxURsWJyknFicqoGCrvqBgqo+K/oLKp+JTKpyp+enFd16MX13U9+uIXFRuVk4p3qIyKoXJSMVQ2FScqm4qhMipOVEbFpmKjMipOVEbFUNlUDJV3qGwqTlTeUTFURsVGZVSMiv+tF9d1PXpxXdcj+4EDlU3FUNlUfAeVk4qhsqnYqPxJFUNlUzFUNhXvUNlUDJVR8Q6Vk4qNyqcqhspJxVAZFX/nxXVdj15c1/Xoi1+ofIeKofKpineobCqGyqZiqIyKjcqmYqOyqRgqm4qhsqkYKpuKTcU7VDYVQ2WojIpNxacqhsqo2FQMlU3FTy+u63r04rquR1/8omKj8g6V76AyKobKpmKonFQMlY3KpmKovKNiqIyKoTJURsVQGSqfUhkVJxUblVGxUdmobCqGyqg4UdlUbCp+9+K6rkcvrut6ZD/wF5VRsVEZFScqJxVDZVQMlU3FRmVTcaIyKobKqDhRGRVDZVQMlU3FicqmYqiMihOVUTFURsWnVEbFUBkVG5VNxUZlVAyVTcVPL67revTiuq5H9gMLlU3FUBkVQ2VUDJVRcaIyKobKqBgqo2KjMiqGyqjYqIyKoTIqhsq/peJTKqPiHSonFUNlVAyVP6liqGwqfvfiuq5HL67remQ/8C9ReUfFRmVUbFRGxVD5VMVGZVOxURkVJyqbiqFyUvEplU3FUBkVQ2VUvENlU3GiMio2KpuKn15c1/XoxXVdj774hcp3qxgVQ2VUfErlu1WcqLxD5URlVGwqNhWfUhkVQ2VUDJWhclJxorKpGCoblVFxorKp+N2L67oevbiu69EXDyo+pbJRGRUblZOKE5Whsqk4UTmpOKkYKpuKT6mMiqHyDpWNyqZio/JvqXhHxUZlVPz04rquRy+u63r0xT+gclLxDpVR8Q6VTcWmYqNyUrFReYfKRuVTKicVG5VNxTtUNhWfUjlR+ZTKqBgVv3txXdejF9d1Pfri/wCVUTFURsVQGRVDZVQMle+gslHZVGwqNiqjYqOyqRgqm4pRcaIyKobKicqmYqMyKobKqBgq30FlVPzuxXVdj15c1/Xoi/8nVDYqo2KojIqNyqh4R8VGZVMxVEbFOyqGylAZFScqo2JTsan4lMqmYqhsVE4qTiqGyt95cV3XoxfXdT364h+o+A4VG5V3VAyV/4LKd1AZFUPlpGKonKiMio3KqNiojIqhMipOKt5RMVRGxVDZVAyVf+rFdV2PXlzX9eiLByrfTWVUjIpPVWwqPqUyKjYVJyqjYlRsVEbFUBkVJyqbineobCqGyqh4h8qoOFHZqIyKjcqm4u+8uK7r0Yvruh7ZD1zXtXpxXdej/wGmCm3JdyuwcgAAAABJRU5ErkJggg==', 16, NULL, NULL, '2025-10-25 14:20:19', '2025-10-25 14:20:19', NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, 0),
('8aba5df4-5480-49fd-b692-62cac93dfe99', 'MAT-20251024-0003', 'Material Dispense - abc', NULL, NULL, 'medium', 1.00, 'units', 0, 0, NULL, 'abc', '2025-10-30', '20:40:00', 'abc', 'abc', '0913566735', 'abc', 'abc', 'approved', NULL, NULL, 'data:image/png;base64,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', 1, 16, '2025-10-25 13:03:52', '2025-10-24 11:37:27', '2025-10-25 13:03:52', NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, 0);
INSERT INTO `materials` (`id`, `tracking_number`, `material_name`, `description`, `category`, `priority`, `quantity`, `unit`, `is_returnable`, `is_non_returnable`, `tenant_id`, `company_name`, `due_date`, `due_time`, `vehicle_plate_no`, `requester_name`, `requester_phone`, `approver_name`, `notes`, `status`, `current_location`, `destination`, `qr_code`, `created_by`, `approved_by`, `approved_at`, `created_at`, `updated_at`, `deleted_at`, `checked_in`, `checked_out`, `checked_in_at`, `checked_out_at`, `checked_in_by`, `checked_out_by`, `gust_id`, `is_gust_entry`) VALUES
('97c93346-5585-4589-98c4-8654403a850d', 'GUST-20251025-0002', 'Gust Material Entry - abd', NULL, NULL, 'medium', 32.00, 'da', 0, 0, NULL, 'abd', '2025-10-25', '18:22:00', '212', 'Gust User', 'N/A', NULL, NULL, 'approved', NULL, NULL, 'data:image/png;base64,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', 1, 1, '2025-10-26 00:22:52', '2025-10-25 20:22:52', '2025-10-26 08:23:10', NULL, 1, 1, '2025-10-26 08:22:52', '2025-10-26 08:23:10', 1, 1, NULL, 1),
('996cb6e4-c640-4caa-ac6f-5130912c2f52', 'MAT-20251024-0001', '', NULL, NULL, 'medium', 1.00, 'units', 0, 0, NULL, 'sda', '2025-10-25', '20:40:00', '33', 'Bereket Tamrat', '0913566735', 'some one', NULL, 'approved', NULL, NULL, 'data:image/png;base64,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', 1, 16, '2025-10-25 13:03:52', '2025-10-24 08:53:47', '2025-10-25 13:03:52', NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, 0),
('9d2b8250-0e13-48db-8fc3-5859231769b2', 'MAT-20251026-10000', 'Material Dispense - star', NULL, NULL, 'medium', 23.00, 'wq', 0, 0, 3, 'star', '2025-10-29', '03:59:00', '123', 'Bereket Tamrat', '0913566735', 'star', 'star', 'pending', NULL, NULL, 'data:image/png;base64,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JypTMSonFU8qTlSmYlSeVDypGJWpGJVR+Tsvrut668V1XW/ZL/yHyknFqEzFqHxXxROVT1ScqEzFqEzFqJxUnKhMxaicVIzKVDxROak4UflExaicVIzKVDxRmYonKp+oGJUnFX/14rqut15c1/XWF3+oGJVRmYpRmYrvUpmKk4pRmYonKicqUzEqUzEqTyq+q+JE5UnFicpUjMpUfKJiVKbiExXfVTEqn6gYlVGZit9eXNf11ovrut764g8qU3GiMhWjclJxonKiMhWjMhVPVE4qTlSmYlSm4onKVHxC5aTiRGVUpuJJxYnKVEzFqEzFqEzFicqTipOKUflpFX/14rqut15c1/XWF/+AypOKE5WTihOV71L5hMpUjMpPUJmKE5UnKlPxiYpR+S6VqTipOFF5UnGiMhVT8YmKUTlRmYrfXlzX9daL67resl94oHJSMSonFaNyUvFdKlMxKp+oeKJyUjEqn6g4UZmKE5XvqhiVqfgulakYlakYlScVozIVozIVn1CZir96cV3XWy+u63rLfuE/VKbiRGUqPqFyUjEqUzEqn6gYlakYlU9UjMqTilGZilGZihOVqRiVk4pReVIxKp+oOFGZiu9SmYoTlak4UZmKUTmp+O3FdV1vvbiu6y37hQOVk4pRmYpRmYonKicVozIVJyonFScqTypG5RMVo/LTKkblpOJEZSpOVKbiicpUjMpUnKhMxYnKd1WMylT8nRfXdb314rqut754o+JJxUnFicpUTMWonFSMypOKJxVPVKZiVKZiVE4qRmUqnqhMxUnFT1CZilGZilGZip+mclLxRGVUpmJUTip+e3Fd11svrut664s/qPy0iqkYlScqJxUnKk9UpmJUpmIqPlHxXSpTcaJyUjEqUzEqU/GJilGZilE5qThROVGZilE5UZmKJypT8XdeXNf11ovrut764o2K71I5UZmK71KZiicqJypTcaLyRGUqvqviScWo/LSKJxVPKkblScWJypOKT1SMyknFby+u63rrxXVdb33xD6g8qXhSMSonFScqU/FEZSpGZSpG5UnFqJyonFScqPy0ip+gclIxKk8qRuUTFaMyKt+lMhWj8lcvrut668V1XW998T+kclJxojIVozIVT1SeVPybVE4qRmUqRmVUpmJUnlSMylQ8qRiVqThRmYqpGJVRmYpRmYpRmYpRmYonKn/nxXVdb724ruutL/6HKp6oTMVJxah8omJUTio+UTEqJxWjclIxKlMxKqMyFU9UPlHxRGUqPlExKicVJxWjMhWjMhWjMhWj8lcvrut668V1XW998Q9U/DSVqZiKn1YxKk9UTiqmYlROKkblROWJyknFd1WMyndVfELlEyonFVPxRGUqRmUq/urFdV1vvbiu660v3lD5aSpPVKbiExUnKlPxRGUqRmUq/lcqnqhMxXdVjMpJxag8UTmpGJVRmYpReaLyk15c1/XWi+u63rJfuK7r6MV1XW/9P30ObkfCWLDmAAAAAElFTkSuQmCC', 1, NULL, NULL, '2025-10-26 07:59:37', '2025-10-26 08:12:05', NULL, 1, 1, '2025-10-26 08:11:53', '2025-10-26 08:12:05', 1, 1, NULL, 0),
('9d9cffb0-278f-4ede-bde3-8f86901bf42d', 'MAT-20251025-0311', 'Material Dispense - something ', NULL, NULL, 'medium', 32.00, 'qwe', 0, 0, 5, 'something ', '2025-10-31', '09:03:00', '1232', 'Yeamlak Tamrat', '0913566735', 'abebe', 'nothing', 'approved', NULL, NULL, 'data:image/png;base64,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', 1, 16, '2025-10-25 13:03:52', '2025-10-25 12:04:17', '2025-10-25 13:03:52', NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, 0),
('9e68aa43-0616-4cbc-8d9f-1f55ec5cdbbe', 'MAT-20251025-31111', 'Material Entry - test2', NULL, NULL, 'medium', 42.00, 'test2', 0, 0, NULL, 'test2', '2025-11-08', '00:25:00', '123', 'Tenant User', 'N/A', NULL, NULL, 'approved', NULL, NULL, 'data:image/png;base64,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', 16, 16, '2025-10-25 13:03:51', '2025-10-25 12:26:12', '2025-10-25 13:03:51', NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, 0),
('ab0876f1-308b-4ca5-816b-61845d9bc9ab', 'MAT-20251024-0009', 'Material Dispense - update the db based on the frontend and update the backend based on the frontend. ', NULL, NULL, 'medium', 123.00, 'items', 0, 0, NULL, 'update the db based on the frontend and update the backend based on the frontend. ', '0001-02-16', '21:07:00', '5244', 'Yeamlak Tamrat', '0913566735', 'update the db based on the frontend and update the backend based on the frontend. ', 'update the db based on the frontend and update the backend based on the frontend. ', 'approved', NULL, NULL, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAAklEQVR4AewaftIAAAuMSURBVO3B0Yoc2ZIAQfek//+XffVSEIjNM52qUs9cCDP7hbXW/+tirXXrYq1162KtdeuL36j8pIoTlaliUrlTcaJyUvGEylRxojJVvKhMFT9JZao4UZkqvktlqphUflLFy8Va69bFWuvWxVrr1hf/oOKTVJ6oOKm4o3JScaIyVUwqU8WkclIxqbxUnKhMFZPKScUTKlPFd6l8UsUnqdy5WGvdulhr3bpYa9364iGVJyqeUJkqTlReKqaKSWVSmSqmiidUTir+lMpU8ZMqTiruVEwqn6TyRMV3Xay1bl2stW5drLVuffEfp/JdKicV71A5qZhUJpWp4rsqTlSmihOVqeJE5aRiUnmpOKn4r7pYa926WGvdulhr3friP67iROW7VD6p4h0qd1SeqJhUTipOKp5QmSruVPyvuFhr3bpYa926WGvd+uKhin+TylTxp1TeoTJVPFHxXSpTxUnFicpUMam8Q+VOxSdV/C0Xa61bF2utWxdrrVtf/AOV/xUqU8WkMlVMKlPFpDJVTCpTxaRyovJS8YTKVDGpTBWTylQxqUwVk8pU8aJyojJVnKj8lIu11q2Ltdati7XWrS9+U/G/ROWl4gmVT6p4R8XfUvE3VdypeEfFv+VirXXrYq1162Ktdct+YVCZKiaVT6p4h8qdihOVqeIdKj+l4kRlqphUpopJZao4UZkqXlROKk5UPqniuy7WWrcu1lq3LtZat774TcWk8o6Kn1JxojJVPKHySRWTyp2KSeUJlROVd1RMKi8VT6hMFScqf8vFWuvWxVrr1sVa65b9wqDyRMUTKlPFicpJxYvKOyomlZOKSeWk4kTlpWJSmSomlaniHSonFZPKVPGiclLxSSpTxYnKVPFysda6dbHWunWx1rplvzCoTBWTyknFEyonFZPKVPGiclLxDpWpYlKZKk5UvqviROUnVfwtKk9U/C0Xa61bF2utW1/8pmJSmSomlSdUpooTlaniuyqeUJkqnqiYVKaKT1GZKk5UpooTlaniROVOxaQyVbxD5aTiRGWqeLlYa926WGvdulhr3friNypTxUnFicpUcaJyojJVvFQ8oTJVTConKicVk8pUMal8ispUMamcVEwqU8VU8VMqJpUTlaliqrhzsda6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', 1, 16, '2025-10-25 13:03:52', '2025-10-24 12:09:03', '2025-10-25 13:03:52', NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, 0),
('bdc27a18-13fa-4a89-aa47-c3694e0eafc8', 'MAT-20251026-10001', 'Material Entry - hayalt ', NULL, NULL, 'medium', 32.00, 'ds', 0, 0, NULL, 'hayalt ', '2025-10-27', '04:54:00', '123', 'Tenant User', 'N/A', NULL, NULL, 'pending', NULL, NULL, 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAAklEQVR4AewaftIAABIjSURBVO3BUW5kR6IlQfcE979lnypABygIkX2VfFT3fISZ/cJ1XUcvrut668V1XW998QeVn1YxKlMxKlMxKlPxE1Q+UTEqTypGZSpGZSpGZSpOVL6r4kTlScWonFSMyknFqEzFicpUnKj8tIrfXlzX9daL67resl/4i8pUfJfKVJyoTMWoTMWoTMWonFSMyknFqEzFicpUnKhMxROVJxUnKlMxKlPxE1Q+UfFE5aTiRGUqRmUqvktlKn57cV3XWy+u63rri39A5UnFJypG5RMqJxUnFaMyKlNxojIVJypT8URlKk5URmUqpuKkYlROKk5UpuJJxYnKScVUjMqoTMV3qTyp+E9eXNf11ovrut764r9I5UnFqHxC5aTipGJUpuJE5RMqT1ROKkZlVJ5UnFSMylScqJxUjMpJxYnKVEzFqIzKVPy3vbiu660X13W99cX/SMWojMpJxahMxYnKqDypGJWfVjEqT1S+S2UqnqhMxahMxXepPFGZihOVqfhveHFd11svrut664t/oOKnqfwElamYilGZiicVozIVozIVozIVo3JS8URlKn5CxYnKVIzKf4vKVEzFJyr+r15c1/XWi+u63vriDZV/U8WoTMWoPKkYlal4ojIVozIVozIVozIVozIVo3KiMhVPVKZiVKZiVKZiVKZiVKZiVKZiVJ5UjMpUjMqJylScqPykF9d1vfXiuq63vvhDxf9PKk4qRmUqTio+UTEqU3FSMSrfVfGJipOKUfmEyidUpmJUpuKJylSMylScVPxbXlzX9daL67re+uIPKlPxRGUqRuWJyonKJypG5btUpuKJypOKUTlR+WkqUzEqn6h4UnFSMSpT8YmKUfkJFScqU/Hbi+u63npxXddb9gsfUDmpeKIyFaMyFScqUzEqU/FEZSo+oTIVJyrfVfFE5aRiVKbiicpUjMpJxah8V8WJylScqEzFicpJxT/14rqut15c1/XWF39QmYrvUnmiMhUnKlMxKlPxROW7VKZiVKZiKkZlKk5URmUqfoLKVIzKicp3VYzKE5Wp+ETFqJxUjMp3vLiu660X13W99cUbKk8qRmUqRuW7KkZlKkZlKp5UfKJiVL5L5UnFk4pROakYlVGZilE5qRiVUflExROVqRiVk4qpOFGZilGZilGZit9eXNf11ovrut6yXzhQOal4ojIVo3JSMSonFaMyFaMyFaNyUnGi8qRiVJ5UjMpUPFGZiicqTypGZSp+gspJxahMxahMxaicVHyXylT83Yvrut56cV3XW/YLf1E5qThROak4UZmKUZmKUZmK/xaVqRiVqXii8qRiVE4qRuWk4qepTMWJyicqTlROKk5UpmJUnlScqEzFby+u63rrxXVdb33xh4rvqhiVqfiEylSMypOKT6h8ouJEZSpOKk5UpmJUTiqeqJxUjMpUjMpUjMpJxYnKicpUTMWJylR8ouITFX/34rqut15c1/XWF39QmYpROakYlan4N1WcqEzFicpUjMpUjMqTip+g8kRlKj6hcqJyojIVo/KkYlROVKbipGJUpmJUPqHypOK3F9d1vfXiuq63vvhDxaicVIzKVIzKVEzFqEzFqJxUnKhMxahMxXdVnKg8qRiVqZiKUZmKn1AxKp+oGJWpeKJyUjEqo/KkYlROKk5UTipG5e9eXNf11ovrut6yXzhQmYonKlMxKlNxovKJihOVqRiVqRiVqRiVk4pRmYpROal4ovITKn6CylSMypOKT6hMxahMxSdUTipG5aTitxfXdb314rqut754o+JEZSpOVE5UpuJJxaicqPwElakYlU9UjMqoTMWoTMWoTMV3qZxUnKhMxUnFqEzFicpUnFR8QmUqRmUqRuVJxd+9uK7rrRfXdb31xR9UnlScVDxRGZWp+GkqTypGZVR+WsWoTMUTlZOKJxWjMipTMRVPVD5R8URlKp5UjMp3VYzKVPz24rqut15c1/XWF/8HKk8qpmJUTlSm4kRlKkblpGJUpmIqRmUqflrFqEzFScUTle9SOakYlak4UXlSMSonKlPxpOJJxYnKVPzdi+u63npxXddbX7xR8V0Vo/JE5UnFJypOKkblEypTMSonFaMyFScqUzEqUzEqJxWjMhWjMhWjclIxKlPxpOKkYlSmYlSmYlR+mspU/Pbiuq63XlzX9Zb9wgdUpmJUTipGZSqeqDypeKLypOJEZSqeqEzFd6mcVJyoPKkYlZOKT6hMxROVk4oTlal4ojIVozIVo3JS8duL67reenFd11tfvKFyUjEqJxWjMhVPVD6hMhUnFU9UpuJE5aTiROVJxaicVIzKScWo/ASVqRiVE5WTipOKUZmKJypT8RMq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', 17, NULL, NULL, '2025-10-26 08:53:27', '2025-10-26 08:53:27', NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, 0),
('cc6c0568-8d4e-4773-b1eb-3e36c176491e', 'MAT-20251024-0002', '', NULL, NULL, 'medium', 1.00, 'units', 0, 0, NULL, 'tets', '2025-10-31', '17:00:00', '1234', 'Yeamlak Tamrat', '0913566735', 'test', 'ok', 'approved', NULL, NULL, 'data:image/png;base64,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', 1, 16, '2025-10-25 13:03:52', '2025-10-24 08:58:41', '2025-10-26 08:24:42', NULL, 0, 1, NULL, '2025-10-26 08:24:42', NULL, 1, NULL, 0);
INSERT INTO `materials` (`id`, `tracking_number`, `material_name`, `description`, `category`, `priority`, `quantity`, `unit`, `is_returnable`, `is_non_returnable`, `tenant_id`, `company_name`, `due_date`, `due_time`, `vehicle_plate_no`, `requester_name`, `requester_phone`, `approver_name`, `notes`, `status`, `current_location`, `destination`, `qr_code`, `created_by`, `approved_by`, `approved_at`, `created_at`, `updated_at`, `deleted_at`, `checked_in`, `checked_out`, `checked_in_at`, `checked_out_at`, `checked_in_by`, `checked_out_by`, `gust_id`, `is_gust_entry`) VALUES
('d119b8c6-3c9d-4349-ab8b-f63f4fe65e9c', 'MAT-20251024-0008', 'Material Dispense - hayal', NULL, NULL, 'medium', 132.00, 'items', 0, 0, NULL, 'hayal', '2025-11-01', '07:08:00', '547', 'hayal', '0913566735', 'hayal', 'hayal', 'approved', NULL, NULL, 'data:image/png;base64,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', 1, 16, '2025-10-25 13:03:52', '2025-10-24 12:02:28', '2025-10-25 13:03:52', NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, 0),
('d7c80c2b-2143-49c3-b608-125cfdc6c37b', 'MAT-20251025-0001', 'Material Entry - abc', NULL, NULL, 'medium', 644.00, 'items', 0, 0, NULL, 'abc', '2025-10-31', '13:41:00', NULL, 'Tenant User', 'N/A', NULL, NULL, 'approved', NULL, NULL, NULL, 1, 16, '2025-10-25 13:03:52', '2025-10-24 16:42:13', '2025-10-25 13:03:52', NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, 0),
('da815b43-c0fd-4f75-8d32-59698f1166de', 'MAT-20251025-0002', 'Material Dispense - dipense ', NULL, NULL, 'medium', 80.00, 'dipense ', 0, 0, NULL, 'dipense ', '2025-10-30', NULL, '4334', 'dipense ', '098887898', 'dipense ', 'dipense ', 'approved', NULL, NULL, 'data:image/png;base64,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', 1, 16, '2025-10-25 13:03:52', '2025-10-25 06:45:54', '2025-10-25 13:03:52', NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `material_items`
--

CREATE TABLE `material_items` (
  `id` int(11) NOT NULL,
  `material_id` varchar(36) NOT NULL,
  `item_name` varchar(200) NOT NULL,
  `measurement` varchar(50) NOT NULL,
  `quantity` int(11) NOT NULL,
  `is_returnable` tinyint(1) DEFAULT 0,
  `is_non_returnable` tinyint(1) DEFAULT 0,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `material_items`
--

INSERT INTO `material_items` (`id`, `material_id`, `item_name`, `measurement`, `quantity`, `is_returnable`, `is_non_returnable`, `description`, `created_at`, `updated_at`) VALUES
(1, '996cb6e4-c640-4caa-ac6f-5130912c2f52', 'ewa', 'kr', 23, 0, 1, NULL, '2025-10-24 08:53:47', '2025-10-24 08:53:47'),
(2, 'cc6c0568-8d4e-4773-b1eb-3e36c176491e', 'test', 'kmp', 12, 0, 1, 'test', '2025-10-24 08:58:41', '2025-10-24 08:58:41'),
(3, '8aba5df4-5480-49fd-b692-62cac93dfe99', 'abc', 'abc', 19, 0, 1, 'test', '2025-10-24 11:37:27', '2025-10-24 11:37:27'),
(4, '26c4e7ea-3476-40d7-81ef-768bc46a00cc', '@MaterialRegistration.jsx ', '@MaterialRegistration.jsx ', 21, 0, 1, '@MaterialRegistration.jsx ', '2025-10-24 11:40:28', '2025-10-24 11:40:28'),
(5, '26c4e7ea-3476-40d7-81ef-768bc46a00cc', '@MaterialRegistration.jsx ', '@MaterialRegistration.jsx ', 21, 0, 1, '@MaterialRegistration.jsx ', '2025-10-24 11:40:28', '2025-10-24 11:40:28'),
(6, '6ca07c02-5533-45e4-8651-491b48975e78', 'one', 'one', 86, 0, 1, 'one', '2025-10-24 11:43:28', '2025-10-24 11:43:28'),
(7, '4d85bf61-1d67-495a-b3a2-eb2772fd3cf3', 'one', 'one', 89, 0, 1, 'one', '2025-10-24 11:49:45', '2025-10-24 11:49:45'),
(8, '4d85bf61-1d67-495a-b3a2-eb2772fd3cf3', 'two', 'two', 65, 0, 1, 'two', '2025-10-24 11:49:45', '2025-10-24 11:49:45'),
(9, '010e1db0-e715-49dd-9be8-4f357b4eba7e', 'two', 'two', 56, 0, 1, 'two', '2025-10-24 11:53:55', '2025-10-24 11:53:55'),
(10, '010e1db0-e715-49dd-9be8-4f357b4eba7e', 'two1', 'two1', 21, 0, 1, 'two', '2025-10-24 11:53:55', '2025-10-24 11:53:55'),
(11, 'd119b8c6-3c9d-4349-ab8b-f63f4fe65e9c', 'hayal1', 'hayal', 67, 0, 1, 'hayal', '2025-10-24 12:02:28', '2025-10-24 12:02:28'),
(12, 'd119b8c6-3c9d-4349-ab8b-f63f4fe65e9c', 'hayal', 'hayal1', 65, 0, 1, NULL, '2025-10-24 12:02:28', '2025-10-24 12:02:28'),
(13, 'ab0876f1-308b-4ca5-816b-61845d9bc9ab', '673', 'kgb', 67, 0, 1, 'update the db based on the frontend and update the backend based on the frontend. ', '2025-10-24 12:09:03', '2025-10-24 12:09:03'),
(14, 'ab0876f1-308b-4ca5-816b-61845d9bc9ab', 'update the db based on the frontend and update the backend based on the frontend. ', 'kp', 56, 1, 0, 'update the db based on the frontend and update the backend based on the frontend. ', '2025-10-24 12:09:03', '2025-10-24 12:09:03'),
(15, '265a2b5e-736f-4ce5-a321-65f5050c0bf5', 'update the ', 'ju', 76, 1, 0, 'update the db based on the frontend and update the backend based on the frontend. ', '2025-10-24 12:11:04', '2025-10-24 12:11:04'),
(16, '265a2b5e-736f-4ce5-a321-65f5050c0bf5', 'update the db based on the frontend and update the backend based on the frontend. ', 'ko', 65, 1, 0, 'update the db based on the frontend and update the backend based on the frontend. ', '2025-10-24 12:11:04', '2025-10-24 12:11:04'),
(17, 'd7c80c2b-2143-49c3-b608-125cfdc6c37b', 'abc', 'ddd', 322, 0, 1, 'abc', '2025-10-24 16:42:13', '2025-10-24 16:42:13'),
(18, 'd7c80c2b-2143-49c3-b608-125cfdc6c37b', 'qqq', 'abc', 322, 0, 1, 'abc', '2025-10-24 16:42:13', '2025-10-24 16:42:13'),
(19, 'da815b43-c0fd-4f75-8d32-59698f1166de', 'dipense ', 'dipense ', 80, 0, 1, 'dipense ', '2025-10-25 06:45:55', '2025-10-25 06:45:55'),
(20, '4d62f924-382e-467b-9e62-1c3dc3de1033', 'hayalk', 'reww', 221, 1, 0, 'testy', '2025-10-25 10:46:42', '2025-10-25 10:46:42'),
(21, '32527b8e-085d-41c8-aeea-789ce0634768', 'qr', 'qr', 32, 0, 0, 'ewq', '2025-10-25 10:53:57', '2025-10-25 10:53:57'),
(22, '9d9cffb0-278f-4ede-bde3-8f86901bf42d', 'something', 'qwe', 32, 1, 0, NULL, '2025-10-25 12:04:17', '2025-10-25 12:04:17'),
(23, '42632e4a-ab88-4618-8387-ff2dc184e1a5', 'teat', 'kp', 321, 1, 0, 'test', '2025-10-25 12:23:09', '2025-10-25 12:23:09'),
(24, '9e68aa43-0616-4cbc-8d9f-1f55ec5cdbbe', 'test2', 'test2', 42, 0, 1, 'test2', '2025-10-25 12:26:12', '2025-10-25 12:26:12'),
(25, '4705cd04-06f5-4f0d-b1ea-de7cb2ab4016', 'test', 'ree', 234, 0, 1, 'test', '2025-10-25 14:10:42', '2025-10-25 14:10:42'),
(26, '4705cd04-06f5-4f0d-b1ea-de7cb2ab4016', 'test', 'test', 32, 0, 1, 'test', '2025-10-25 14:10:42', '2025-10-25 14:10:42'),
(27, '51558c7b-25df-4b6e-95e0-ef6902c3cb5a', 'test', 'ree', 234, 0, 1, 'test', '2025-10-25 14:13:46', '2025-10-25 14:13:46'),
(28, '51558c7b-25df-4b6e-95e0-ef6902c3cb5a', 'test', 'test', 32, 0, 1, 'test', '2025-10-25 14:13:46', '2025-10-25 14:13:46'),
(29, '747df6fa-79ec-4757-91fd-cc452624e818', 'dspense', 'hd', 32, 1, 0, 'dspense', '2025-10-25 14:20:19', '2025-10-25 14:20:19'),
(30, '49da4052-6f59-4923-9427-b64b0775acf3', 'dspense', 'gd', 423, 1, 0, 'dspense', '2025-10-25 14:21:47', '2025-10-25 14:21:47'),
(31, '180b3dd4-14ef-4467-950e-73cd6fe54d7c', 'eww', 'ew', 23, 1, 0, 'eqew', '2025-10-25 20:04:23', '2025-10-25 20:04:23'),
(32, '5befa04a-4ffe-480f-90c3-d3ef6eb0934f', 'eww', 'ew', 323, 1, 0, '323', '2025-10-25 20:20:19', '2025-10-25 20:20:19'),
(33, '97c93346-5585-4589-98c4-8654403a850d', 'dada', 'da', 32, 1, 0, 'dasd', '2025-10-25 20:22:52', '2025-10-25 20:22:52'),
(34, '9d2b8250-0e13-48db-8fc3-5859231769b2', 'star', 'wq', 23, 1, 0, 'star', '2025-10-26 07:59:37', '2025-10-26 07:59:37'),
(35, 'bdc27a18-13fa-4a89-aa47-c3694e0eafc8', 'hayalt ', 'ds', 32, 1, 0, 'hayalt ', '2025-10-26 08:53:27', '2025-10-26 08:53:27'),
(36, '0a740ed5-a210-4ee1-b55a-0321d65aa45a', 'hayalt ', 'ds', 323, 1, 0, 'hayalt ', '2025-10-26 08:55:53', '2025-10-26 08:55:53'),
(37, '33f50ee6-0e0a-4575-902a-33ff2ec6b22a', 'hayalt ', 'ds', 323, 1, 0, 'hayalt ', '2025-10-26 08:56:37', '2025-10-26 08:56:37'),
(38, '30813f3d-ec2a-4441-8be4-d60886fac065', 'hayalt ', 'ds', 323, 1, 0, 'hayalt ', '2025-10-26 08:58:32', '2025-10-26 08:58:32');

-- --------------------------------------------------------

--
-- Table structure for table `material_timeline`
--

CREATE TABLE `material_timeline` (
  `id` int(11) NOT NULL,
  `material_id` varchar(36) NOT NULL,
  `action` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `material_timeline`
--

INSERT INTO `material_timeline` (`id`, `material_id`, `action`, `description`, `user_id`, `location`, `created_at`) VALUES
(1, '996cb6e4-c640-4caa-ac6f-5130912c2f52', 'created', 'Material dispense application registered in system', 1, NULL, '2025-10-24 08:53:47'),
(2, 'cc6c0568-8d4e-4773-b1eb-3e36c176491e', 'created', 'Material dispense application registered in system', 1, NULL, '2025-10-24 08:58:41'),
(3, '8aba5df4-5480-49fd-b692-62cac93dfe99', 'created', 'Material dispense application registered in system', 1, NULL, '2025-10-24 11:37:27'),
(4, '26c4e7ea-3476-40d7-81ef-768bc46a00cc', 'created', 'Material dispense application registered in system', 1, NULL, '2025-10-24 11:40:28'),
(5, '6ca07c02-5533-45e4-8651-491b48975e78', 'created', 'Material dispense application registered in system', 1, NULL, '2025-10-24 11:43:28'),
(6, '4d85bf61-1d67-495a-b3a2-eb2772fd3cf3', 'created', 'Material dispense application registered in system', 1, NULL, '2025-10-24 11:49:45'),
(7, '010e1db0-e715-49dd-9be8-4f357b4eba7e', 'created', 'Material dispense application registered in system', 1, NULL, '2025-10-24 11:53:55'),
(8, 'd119b8c6-3c9d-4349-ab8b-f63f4fe65e9c', 'created', 'Material dispense application registered in system', 1, NULL, '2025-10-24 12:02:28'),
(9, 'ab0876f1-308b-4ca5-816b-61845d9bc9ab', 'created', 'Material dispense application registered in system', 1, NULL, '2025-10-24 12:09:03'),
(10, '265a2b5e-736f-4ce5-a321-65f5050c0bf5', 'created', 'Material dispense application registered in system', 1, NULL, '2025-10-24 12:11:04'),
(11, 'd7c80c2b-2143-49c3-b608-125cfdc6c37b', 'created', 'Material registered by tenant: abc', 1, NULL, '2025-10-24 16:42:13'),
(12, 'da815b43-c0fd-4f75-8d32-59698f1166de', 'created', 'Material dispense application registered in system', 1, NULL, '2025-10-25 06:45:56'),
(13, '4d62f924-382e-467b-9e62-1c3dc3de1033', 'created', 'Material registered by tenant: nathan', 1, NULL, '2025-10-25 10:46:42'),
(14, '32527b8e-085d-41c8-aeea-789ce0634768', 'created', 'Material registered by tenant: qr', 1, NULL, '2025-10-25 10:53:57'),
(15, '9d9cffb0-278f-4ede-bde3-8f86901bf42d', 'created', 'Material dispense application registered in system', 1, NULL, '2025-10-25 12:04:17'),
(16, '42632e4a-ab88-4618-8387-ff2dc184e1a5', 'created', 'Material dispense application registered in system', 16, NULL, '2025-10-25 12:23:09'),
(17, '9e68aa43-0616-4cbc-8d9f-1f55ec5cdbbe', 'created', 'Material registered by tenant: test2', 16, NULL, '2025-10-25 12:26:12'),
(18, '32527b8e-085d-41c8-aeea-789ce0634768', 'approved', 'Material approveed: ok', 16, NULL, '2025-10-25 13:03:04'),
(19, '9e68aa43-0616-4cbc-8d9f-1f55ec5cdbbe', 'approved', 'Material approveed: Bulk approved via quick action', 16, NULL, '2025-10-25 13:03:51'),
(20, '9d9cffb0-278f-4ede-bde3-8f86901bf42d', 'approved', 'Material approveed: Bulk approved via quick action', 16, NULL, '2025-10-25 13:03:52'),
(21, '42632e4a-ab88-4618-8387-ff2dc184e1a5', 'approved', 'Material approveed: Bulk approved via quick action', 16, NULL, '2025-10-25 13:03:52'),
(22, '265a2b5e-736f-4ce5-a321-65f5050c0bf5', 'approved', 'Material approveed: Bulk approved via quick action', 16, NULL, '2025-10-25 13:03:52'),
(23, 'ab0876f1-308b-4ca5-816b-61845d9bc9ab', 'approved', 'Material approveed: Bulk approved via quick action', 16, NULL, '2025-10-25 13:03:52'),
(24, '4d62f924-382e-467b-9e62-1c3dc3de1033', 'approved', 'Material approveed: Bulk approved via quick action', 16, NULL, '2025-10-25 13:03:52'),
(25, 'da815b43-c0fd-4f75-8d32-59698f1166de', 'approved', 'Material approveed: Bulk approved via quick action', 16, NULL, '2025-10-25 13:03:52'),
(26, 'd7c80c2b-2143-49c3-b608-125cfdc6c37b', 'approved', 'Material approveed: Bulk approved via quick action', 16, NULL, '2025-10-25 13:03:52'),
(27, 'd119b8c6-3c9d-4349-ab8b-f63f4fe65e9c', 'approved', 'Material approveed: Bulk approved via quick action', 16, NULL, '2025-10-25 13:03:52'),
(28, '4d85bf61-1d67-495a-b3a2-eb2772fd3cf3', 'approved', 'Material approveed: Bulk approved via quick action', 16, NULL, '2025-10-25 13:03:52'),
(29, '010e1db0-e715-49dd-9be8-4f357b4eba7e', 'approved', 'Material approveed: Bulk approved via quick action', 16, NULL, '2025-10-25 13:03:52'),
(30, '6ca07c02-5533-45e4-8651-491b48975e78', 'approved', 'Material approveed: Bulk approved via quick action', 16, NULL, '2025-10-25 13:03:52'),
(31, '26c4e7ea-3476-40d7-81ef-768bc46a00cc', 'approved', 'Material approveed: Bulk approved via quick action', 16, NULL, '2025-10-25 13:03:52'),
(32, 'cc6c0568-8d4e-4773-b1eb-3e36c176491e', 'approved', 'Material approveed: Bulk approved via quick action', 16, NULL, '2025-10-25 13:03:52'),
(33, '8aba5df4-5480-49fd-b692-62cac93dfe99', 'approved', 'Material approveed: Bulk approved via quick action', 16, NULL, '2025-10-25 13:03:52'),
(34, '996cb6e4-c640-4caa-ac6f-5130912c2f52', 'approved', 'Material approveed: Bulk approved via quick action', 16, NULL, '2025-10-25 13:03:52'),
(35, '51558c7b-25df-4b6e-95e0-ef6902c3cb5a', 'created', 'Material registered by tenant: test', 16, NULL, '2025-10-25 14:13:46'),
(36, '51558c7b-25df-4b6e-95e0-ef6902c3cb5a', 'approved', 'Material approveed: let the material pass', 16, NULL, '2025-10-25 14:17:32'),
(37, '51558c7b-25df-4b6e-95e0-ef6902c3cb5a', 'approved', 'Material approveed: approved\n', 16, NULL, '2025-10-25 14:18:00'),
(38, '747df6fa-79ec-4757-91fd-cc452624e818', 'created', 'Material dispense application registered in system', 16, NULL, '2025-10-25 14:20:19'),
(39, '49da4052-6f59-4923-9427-b64b0775acf3', 'created', 'Material registered by tenant: dspense', 16, NULL, '2025-10-25 14:21:47'),
(40, '49da4052-6f59-4923-9427-b64b0775acf3', 'approved', 'Material approveed: good', 16, NULL, '2025-10-25 14:54:49'),
(41, '180b3dd4-14ef-4467-950e-73cd6fe54d7c', 'created', 'Material registered by tenant: ewew', 1, NULL, '2025-10-25 20:04:23'),
(42, '180b3dd4-14ef-4467-950e-73cd6fe54d7c', 'approved', 'Material approveed: qw', 1, NULL, '2025-10-25 20:27:53'),
(43, '9d2b8250-0e13-48db-8fc3-5859231769b2', 'created', 'Material dispense application registered in system', 1, NULL, '2025-10-26 07:59:37'),
(44, '9d2b8250-0e13-48db-8fc3-5859231769b2', 'checkout', 'Material checked out by user ID: 1', 1, NULL, '2025-10-26 08:09:13'),
(45, '9d2b8250-0e13-48db-8fc3-5859231769b2', 'checkin', 'Material checked in by user ID: 1', 1, NULL, '2025-10-26 08:11:53'),
(46, '9d2b8250-0e13-48db-8fc3-5859231769b2', 'checkout', 'Material checked out by user ID: 1', 1, NULL, '2025-10-26 08:12:05'),
(47, '49da4052-6f59-4923-9427-b64b0775acf3', 'checkin', 'Material checked in by user ID: 1', 1, NULL, '2025-10-26 08:24:05'),
(48, 'cc6c0568-8d4e-4773-b1eb-3e36c176491e', 'checkout', 'Material checked out by user ID: 1', 1, NULL, '2025-10-26 08:24:42'),
(49, 'bdc27a18-13fa-4a89-aa47-c3694e0eafc8', 'created', 'Material registered by tenant: hayalt ', 17, NULL, '2025-10-26 08:53:27'),
(50, '0a740ed5-a210-4ee1-b55a-0321d65aa45a', 'created', 'Material dispense application registered in system', 17, NULL, '2025-10-26 08:55:53'),
(51, '33f50ee6-0e0a-4575-902a-33ff2ec6b22a', 'created', 'Material dispense application registered in system', 17, NULL, '2025-10-26 08:56:37'),
(52, '30813f3d-ec2a-4441-8be4-d60886fac065', 'created', 'Material dispense application registered in system', 17, NULL, '2025-10-26 08:58:32'),
(53, '30813f3d-ec2a-4441-8be4-d60886fac065', 'approved', 'Material approveed: permited', 17, NULL, '2025-10-26 09:06:47'),
(54, '0a740ed5-a210-4ee1-b55a-0321d65aa45a', 'approved', 'Material approveed: good', 17, NULL, '2025-10-26 09:16:12'),
(55, '33f50ee6-0e0a-4575-902a-33ff2ec6b22a', 'rejected', 'Material rejected: nothing', 17, NULL, '2025-10-26 09:21:35');

-- --------------------------------------------------------

--
-- Table structure for table `menu_items`
--

CREATE TABLE `menu_items` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `path` varchar(255) NOT NULL,
  `icon` varchar(50) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `component_name` varchar(255) DEFAULT NULL,
  `module_name` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `menu_items`
--

INSERT INTO `menu_items` (`id`, `name`, `path`, `icon`, `parent_id`, `sort_order`, `component_name`, `module_name`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Dashboard', '/', 'bi-speedometer2', NULL, 1, 'DashboardView', 'dashboard', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(2, 'Visitor Management', '/visitors', 'bi-person-badge', NULL, 2, NULL, 'visitors', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(3, 'Visitor Dashboard', '/visitors/dashboard', 'bi-graph-up', 2, 1, 'VisitorDashboard', 'visitors', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(4, 'Pre-Registration', '/visitors/register', 'bi-clipboard-check', 2, 2, 'VisitorRegistration', 'visitors', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(5, 'Check-In/Out', '/visitors/checkin', 'bi-door-open', 2, 3, 'VisitorCheckIn', 'visitors', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(6, 'Visitors List', '/visitors', 'bi-people', 2, 4, 'VisitorsList', 'visitors', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(7, 'Material Management', '/materials', 'bi-box-seam', NULL, 3, NULL, 'materials', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(8, 'Material Dashboard', '/materials/dashboard', 'bi-grid-3x3-gap', 7, 1, 'MaterialDashboard', 'materials', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(9, 'Materials List', '/materials', 'bi-list-ul', 7, 2, 'MaterialsList', 'materials', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(10, 'Material Registration', '/materials/register', 'bi-plus-circle', 7, 3, 'MaterialRegistration', 'materials', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(11, 'Gate Pass Scanning', '/materials/scan', 'bi-qr-code-scan', 7, 4, 'GatePassValidation', 'materials', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(12, 'Tenant Management', '/tenants', 'bi-building', NULL, 4, NULL, 'tenants', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(13, 'Tenants List', '/tenants', 'bi-buildings', 12, 1, 'TenantsList', 'tenants', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(14, 'Tenant Profile', '/tenantprofile', 'bi-building-gear', 12, 2, 'CurrentTenantProfile', 'tenants', NULL, 1, '2025-10-24 08:22:41', '2025-10-29 19:14:25'),
(15, 'User Management', '/users', 'bi-people-fill', NULL, 5, NULL, 'users', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(16, 'Users List', '/UserTable', 'bi-table', 15, 1, 'UserTable', 'users', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(17, 'Add User', '/UserForm', 'bi-person-plus', 15, 2, 'UserRegistrationForm', 'users', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(18, 'Employee Management', '/employees', 'bi-person-workspace', NULL, 6, NULL, 'employees', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(19, 'Employees List', '/EmployeeTable', 'bi-table', 18, 1, 'EmployeeTable', 'employees', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(20, 'Add Employee', '/EmployeeForm', 'bi-person-plus-fill', 18, 2, 'EmployeeRegistrationForm', 'employees', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(21, 'Approvals & Workflow', '/approvals', 'bi-check-circle', NULL, 7, NULL, 'approvals', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(22, 'Approvals Inbox', '/approvals', 'bi-inbox', 21, 1, 'ApprovalsInbox', 'approvals', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(23, 'Reports & Analytics', '/reports', 'bi-bar-chart-line', NULL, 8, NULL, 'reports', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(24, 'Analytics Dashboard', '/reports/analytics', 'bi-graph-up-arrow', 23, 1, 'ReportsAnalytics', 'reports', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(25, 'Data Export', '/reports/export', 'bi-download', 23, 2, 'DataExport', 'reports', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(26, 'Communication', '/communication', 'bi-chat-dots', NULL, 9, NULL, 'communication', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(27, 'Notifications', '/notifications', 'bi-bell', 26, 1, 'NotificationsList', 'communication', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(28, 'Messages', '/messages', 'bi-envelope', 26, 2, 'MessagesList', 'communication', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(29, 'Security & Compliance', '/security', 'bi-shield-check', NULL, 10, NULL, 'security', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(30, 'Access Logs', '/security/logs', 'bi-file-earmark-text', 29, 1, 'AccessLogs', 'security', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(31, 'Audit Trail', '/security/audit', 'bi-clock-history', 29, 2, 'AuditTrail', 'security', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(32, 'System Configuration', '/config', 'bi-gear', NULL, 11, NULL, 'configuration', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(33, 'General Settings', '/config/general', 'bi-sliders', 32, 1, 'GeneralSettings', 'configuration', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(34, 'Feature Flags', '/config/features', 'bi-toggles', 32, 2, 'FeatureFlags', 'configuration', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(35, 'Integrations', '/config/integrations', 'bi-plug', 32, 3, 'Integrations', 'configuration', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(36, 'System Administration', '/admin', 'bi-shield-lock', NULL, 12, NULL, 'administration', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(37, 'Menu Permissions', '/menu-permissions', 'bi-key', 36, 1, 'MenuPermissions', 'administration', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(38, 'Role Management', '/admin/roles', 'bi-person-badge-fill', 36, 2, 'RoleManagement', 'administration', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(39, 'System Logs', '/admin/logs', 'bi-journal-code', 36, 3, 'SystemLogs', 'administration', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(40, 'Database Backup', '/admin/backup', 'bi-database', 36, 4, 'DatabaseBackup', 'administration', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(41, 'My Profile', '/profile', 'bi-person-circle', NULL, 13, 'ProfileView', 'profile', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(42, 'Settings', '/settings', 'bi-gear-fill', NULL, 14, 'SettingsView', 'settings', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(43, 'Help & Support', '/help', 'bi-question-circle', NULL, 15, NULL, 'help', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(44, 'Documentation', '/help/docs', 'bi-book', 43, 1, 'Documentation', 'help', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(45, 'Contact Support', '/help/contact', 'bi-headset', 43, 2, 'ContactSupport', 'help', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(46, 'Task Management', '/tasks', 'bi-list-check', NULL, 16, NULL, 'tasks', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(47, 'My Tasks', '/tasks/my-tasks', 'bi-check2-square', 46, 1, 'MyTasks', 'tasks', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(48, 'Task Calendar', '/tasks/calendar', 'bi-calendar-check', 46, 2, 'TaskCalendar', 'tasks', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(49, 'Quick Actions', '/quick', 'bi-lightning', NULL, 17, NULL, 'quick', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(50, 'Quick Check-In', '/quick/checkin', 'bi-box-arrow-in-right', 49, 1, 'QuickCheckIn', 'quick', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(51, 'Quick Material Scan', '/quick/scan', 'bi-upc-scan', 49, 2, 'QuickScan', 'quick', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(52, 'Add New Tenant', '/tenants/register', 'bi-building-add', 12, 3, 'TenantRegistration', 'tenants', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(53, 'Tenant Users', '/tenants/:id/users', 'bi-people', 12, 4, 'TenantUsers', 'tenants', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(54, 'Context Switcher', '/context', 'bi-arrow-left-right', NULL, 18, 'ContextSwitcher', 'context', NULL, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(55, 'tets', '/test', 'bi-gear', 23, 1, NULL, NULL, NULL, 1, '2025-10-24 08:38:36', '2025-10-24 08:38:36'),
(56, 'Material Regitration Gust', '/Material-Regitration-Gust', 'bi-file-earmark-text', 7, 4, NULL, NULL, NULL, 1, '2025-10-24 12:58:10', '2025-10-24 12:58:10'),
(57, 'Material Dasboard Tenant', '/material-dashboard-tenant', 'bi-speedometer2', 7, 1, NULL, NULL, NULL, 1, '2025-10-24 12:59:33', '2025-10-25 10:25:03'),
(58, 'Material Entry Registration-tenant', '/material-registration-tenant', 'bi-file-earmark-text', 7, 1, NULL, NULL, NULL, 1, '2025-10-24 14:38:00', '2025-10-24 16:07:31'),
(59, 'My Material Lists', '/materials-list-tenant', 'bi-file-earmark-text', 7, 1, NULL, NULL, NULL, 1, '2025-10-25 12:14:34', '2025-10-25 12:14:34');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','success','warning','error') DEFAULT 'info',
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `level` int(11) DEFAULT 0,
  `status` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`role_id`, `role_name`, `description`, `level`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Super Admin', 'Full system access', 10, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(2, 'Admin', 'Park-level administration', 9, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(3, 'Tenant Manager', 'Company representative', 7, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(4, 'Tenant Staff', 'Company employee', 5, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(5, 'Security Guard', 'Gate operations', 6, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(6, 'Receptionist', 'Front desk operations', 5, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(7, 'Visitor', 'Guest access', 1, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(8, 'Material Handler', 'Delivery operations', 4, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(9, 'Internal Security', 'Senior gate operations', 7, 1, '2025-10-24 08:22:41', '2025-10-26 08:28:07'),
(10, 'System', 'Automated processes', 0, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41');

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `menu_item_id` int(11) NOT NULL,
  `can_view` tinyint(1) DEFAULT 1,
  `can_create` tinyint(1) DEFAULT 0,
  `can_edit` tinyint(1) DEFAULT 0,
  `can_delete` tinyint(1) DEFAULT 0,
  `can_approve` tinyint(1) DEFAULT 0,
  `can_export` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`id`, `role_id`, `menu_item_id`, `can_view`, `can_create`, `can_edit`, `can_delete`, `can_approve`, `can_export`, `created_at`, `updated_at`) VALUES
(134, 6, 1, 1, 0, 0, 0, 0, 0, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(135, 6, 2, 1, 0, 0, 0, 0, 0, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(136, 6, 3, 1, 0, 0, 0, 0, 0, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(137, 6, 4, 1, 1, 1, 0, 0, 0, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(138, 6, 5, 1, 1, 1, 0, 0, 0, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(139, 6, 6, 1, 1, 1, 0, 0, 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(140, 6, 41, 1, 0, 1, 0, 0, 0, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(141, 3, 1, 1, 1, 1, 1, 1, 1, '2025-10-24 08:22:41', '2025-10-29 10:42:44'),
(142, 3, 2, 1, 1, 1, 1, 1, 1, '2025-10-24 08:22:41', '2025-10-29 10:42:44'),
(143, 3, 4, 1, 1, 1, 1, 1, 1, '2025-10-24 08:22:41', '2025-10-29 10:42:44'),
(144, 3, 6, 1, 1, 1, 1, 1, 1, '2025-10-24 08:22:41', '2025-10-29 10:42:44'),
(145, 3, 7, 1, 1, 1, 1, 1, 1, '2025-10-24 08:22:41', '2025-10-29 10:42:44'),
(146, 3, 10, 1, 1, 1, 1, 1, 1, '2025-10-24 08:22:41', '2025-10-29 10:42:44'),
(147, 3, 13, 1, 1, 1, 1, 1, 1, '2025-10-24 08:22:41', '2025-10-29 10:42:44'),
(148, 3, 14, 1, 1, 1, 1, 1, 1, '2025-10-24 08:22:41', '2025-10-29 10:42:44'),
(149, 3, 41, 1, 1, 1, 1, 1, 1, '2025-10-24 08:22:41', '2025-10-29 10:42:44'),
(150, 3, 53, 1, 1, 1, 1, 1, 1, '2025-10-24 08:22:41', '2025-10-29 10:42:44'),
(151, 3, 54, 1, 0, 0, 0, 0, 0, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(216, 2, 30, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(217, 2, 24, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(218, 2, 22, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(219, 2, 1, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(220, 2, 44, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(221, 2, 19, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(222, 2, 33, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(223, 2, 57, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(224, 2, 8, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(225, 2, 37, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(226, 2, 47, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(227, 2, 27, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(228, 2, 50, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(229, 2, 13, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(230, 2, 55, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(231, 2, 16, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(232, 2, 3, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(233, 2, 20, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(234, 2, 17, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(235, 2, 31, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(236, 2, 45, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(237, 2, 25, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(238, 2, 34, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(239, 2, 9, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(240, 2, 28, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(241, 2, 4, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(242, 2, 51, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(243, 2, 38, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(244, 2, 48, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(245, 2, 14, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(246, 2, 2, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(247, 2, 52, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(248, 2, 5, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(249, 2, 35, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(250, 2, 7, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(251, 2, 10, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(252, 2, 39, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(253, 2, 40, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(254, 2, 11, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(255, 2, 56, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(256, 2, 12, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(257, 2, 53, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(258, 2, 6, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(259, 2, 15, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(260, 2, 18, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(261, 2, 21, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(262, 2, 23, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(263, 2, 26, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(264, 2, 29, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(265, 2, 32, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(266, 2, 36, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(267, 2, 41, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(268, 2, 42, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(269, 2, 43, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(270, 2, 46, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(271, 2, 49, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(272, 2, 54, 1, 1, 1, 1, 0, 0, '2025-10-24 13:27:19', '2025-10-24 13:27:19'),
(275, 5, 30, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(276, 5, 24, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(277, 5, 22, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(278, 5, 1, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(279, 5, 44, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(280, 5, 19, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(281, 5, 33, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(282, 5, 57, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(283, 5, 8, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(284, 5, 37, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(285, 5, 47, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(286, 5, 27, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(287, 5, 50, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(288, 5, 13, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(289, 5, 55, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(290, 5, 16, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(291, 5, 3, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(292, 5, 20, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(293, 5, 17, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(294, 5, 31, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(295, 5, 45, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(296, 5, 25, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(297, 5, 34, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(298, 5, 9, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(299, 5, 28, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(300, 5, 4, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(301, 5, 51, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(302, 5, 38, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(303, 5, 48, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(304, 5, 14, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(305, 5, 2, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(306, 5, 52, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(307, 5, 5, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(308, 5, 35, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(309, 5, 7, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(310, 5, 10, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(311, 5, 39, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(312, 5, 40, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(313, 5, 11, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(314, 5, 56, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(315, 5, 12, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(316, 5, 53, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(317, 5, 6, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(318, 5, 15, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(319, 5, 18, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(320, 5, 21, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(321, 5, 23, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(322, 5, 26, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(323, 5, 29, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(324, 5, 32, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(325, 5, 36, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(326, 5, 41, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(327, 5, 42, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(328, 5, 43, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(329, 5, 46, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(330, 5, 49, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(331, 5, 54, 1, 1, 1, 1, 0, 0, '2025-10-24 13:57:56', '2025-10-24 13:57:56'),
(332, 2, 58, 1, 1, 1, 1, 0, 0, '2025-10-24 14:38:29', '2025-10-24 14:38:29'),
(393, 1, 30, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(394, 1, 24, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(395, 1, 22, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(396, 1, 1, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(397, 1, 44, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(398, 1, 19, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(399, 1, 33, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(400, 1, 57, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(401, 1, 8, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(402, 1, 58, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(403, 1, 37, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(404, 1, 59, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(405, 1, 47, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(406, 1, 27, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(407, 1, 50, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(408, 1, 13, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(409, 1, 55, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(410, 1, 16, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(411, 1, 3, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(412, 1, 20, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(413, 1, 17, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(414, 1, 31, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(415, 1, 45, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(416, 1, 25, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(417, 1, 34, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(418, 1, 9, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(419, 1, 28, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(420, 1, 4, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(421, 1, 51, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(422, 1, 38, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(423, 1, 48, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(424, 1, 14, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(425, 1, 2, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(426, 1, 52, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(427, 1, 5, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(428, 1, 35, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(429, 1, 7, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(430, 1, 10, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(431, 1, 39, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(432, 1, 40, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(433, 1, 11, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(434, 1, 56, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(435, 1, 12, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(436, 1, 53, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(437, 1, 6, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(438, 1, 15, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(439, 1, 18, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(440, 1, 21, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(441, 1, 23, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(442, 1, 26, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(443, 1, 29, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(444, 1, 32, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(445, 1, 36, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(446, 1, 41, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(447, 1, 42, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(448, 1, 43, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(449, 1, 46, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(450, 1, 49, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(451, 1, 54, 1, 1, 1, 1, 0, 0, '2025-10-25 12:16:04', '2025-10-25 12:16:04'),
(452, 5, 59, 1, 1, 1, 1, 0, 0, '2025-10-25 12:18:51', '2025-10-25 12:18:51'),
(453, 5, 58, 1, 1, 1, 1, 0, 0, '2025-10-25 12:18:53', '2025-10-25 12:18:53'),
(474, 9, 22, 1, 1, 1, 1, 0, 0, '2025-10-26 08:47:55', '2025-10-26 08:47:55'),
(475, 9, 57, 1, 1, 1, 1, 0, 0, '2025-10-26 08:47:55', '2025-10-26 08:47:55'),
(476, 9, 8, 1, 1, 1, 1, 0, 0, '2025-10-26 08:47:55', '2025-10-26 08:47:55'),
(477, 9, 58, 1, 1, 1, 1, 0, 0, '2025-10-26 08:47:55', '2025-10-26 08:47:55'),
(478, 9, 59, 1, 1, 1, 1, 0, 0, '2025-10-26 08:47:55', '2025-10-26 08:47:55'),
(479, 9, 9, 1, 1, 1, 1, 0, 0, '2025-10-26 08:47:55', '2025-10-26 08:47:55'),
(480, 9, 7, 1, 1, 1, 1, 0, 0, '2025-10-26 08:47:55', '2025-10-26 08:47:55'),
(481, 9, 10, 1, 1, 1, 1, 0, 0, '2025-10-26 08:47:55', '2025-10-26 08:47:55'),
(482, 9, 11, 1, 1, 1, 1, 0, 0, '2025-10-26 08:47:55', '2025-10-26 08:47:55'),
(483, 9, 56, 1, 1, 1, 1, 0, 0, '2025-10-26 08:47:55', '2025-10-26 08:47:55'),
(484, 9, 21, 1, 1, 1, 1, 0, 0, '2025-10-26 08:47:55', '2025-10-26 08:47:55'),
(491, 3, 12, 1, 1, 1, 1, 1, 1, '2025-10-29 10:42:44', '2025-10-29 10:42:44'),
(494, 3, 23, 1, 1, 1, 1, 1, 1, '2025-10-29 10:42:44', '2025-10-29 10:42:44'),
(495, 3, 24, 1, 1, 1, 1, 1, 1, '2025-10-29 10:42:44', '2025-10-29 10:42:44'),
(496, 3, 25, 1, 1, 1, 1, 1, 1, '2025-10-29 10:42:44', '2025-10-29 10:42:44'),
(497, 3, 32, 1, 1, 1, 1, 1, 1, '2025-10-29 10:42:44', '2025-10-29 10:42:44'),
(498, 3, 33, 1, 1, 1, 1, 1, 1, '2025-10-29 10:42:44', '2025-10-29 10:42:44'),
(499, 3, 34, 1, 1, 1, 1, 1, 1, '2025-10-29 10:42:44', '2025-10-29 10:42:44'),
(501, 3, 52, 1, 1, 1, 1, 1, 1, '2025-10-29 10:42:44', '2025-10-29 10:42:44');

-- --------------------------------------------------------

--
-- Table structure for table `tenants`
--

CREATE TABLE `tenants` (
  `id` int(11) NOT NULL,
  `tenant_code` varchar(20) NOT NULL,
  `name` varchar(200) NOT NULL,
  `company_name` varchar(200) DEFAULT NULL,
  `business_type` varchar(100) NOT NULL DEFAULT 'Technology',
  `zone` varchar(100) NOT NULL DEFAULT 'Technology Zone',
  `category` varchar(100) NOT NULL DEFAULT 'Technology',
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `contact_person` varchar(200) DEFAULT NULL,
  `contact_email` varchar(100) DEFAULT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `building` varchar(100) DEFAULT NULL,
  `floor` varchar(50) DEFAULT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `status` enum('active','inactive','suspended','pending') DEFAULT 'pending',
  `max_employees` int(11) DEFAULT 50,
  `settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`settings`)),
  `branding` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`branding`)),
  `primary_admin_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tenants`
--

INSERT INTO `tenants` (`id`, `tenant_code`, `name`, `company_name`, `business_type`, `zone`, `category`, `email`, `phone`, `contact_person`, `contact_email`, `contact_phone`, `address`, `building`, `floor`, `unit`, `status`, `max_employees`, `settings`, `branding`, `primary_admin_id`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'TEN-001', 'Gebeya Inc', 'Gebeya Incorporated', 'Technology', 'Technology Zone', 'Software Development', 'contact@gebeya.com', '+251-11-123-4567', 'Amadou Daffe', 'amadou@gebeya.com', '+251-911-123456', 'Addis Ababa, Ethiopia', 'Building 1', 'Floor 3', 'Unit 301-305', 'active', 100, '{\"max_visitors\": 100, \"working_hours\": {\"start\": \"08:00\", \"end\": \"18:00\"}}', '{\"color\": \"#FF6B35\", \"theme\": \"modern\"}', 13, '2025-10-24 08:22:41', '2025-10-29 09:06:02', NULL),
(2, 'TEN-002', 'iCog Labs', 'iCog Labs PLC', 'AI & Machine Learning', 'Innovation Zone', 'AI & Machine Learning', 'hello@icog-labs.com', '+251-11-234-5678', 'Dr. Getnet Bewket', 'getnet@icog-labs.com', '+251-911-234567', 'Addis Ababa, Ethiopia', 'Building 2', 'Floor 4', 'Unit 401-403', 'active', 80, '{\"max_visitors\": 80, \"working_hours\": {\"start\": \"09:00\", \"end\": \"17:00\"}}', '{\"color\": \"#2E86AB\", \"theme\": \"tech\"}', 9, '2025-10-24 08:22:41', '2025-10-29 09:06:02', NULL),
(3, 'TEN-003', 'Sheba Platform Technologies', 'Sheba Platform Technologies PLC', 'Technology', 'Technology Zone', 'Technology', 'info@shebaplatform.com', '+251-11-345-6789', 'Aman Aberra', 'aman@shebaplatform.com', '+251-911-345678', 'Addis Ababa, Ethiopia', 'Building 1', 'Floor 2', 'Unit 201-203', 'active', 50, '{\"max_visitors\": 50, \"working_hours\": {\"start\": \"08:30\", \"end\": \"17:30\"}}', '{\"color\": \"#06A77D\", \"theme\": \"green\"}', 10, '2025-10-24 08:22:41', '2025-10-24 08:22:41', NULL),
(4, 'TEN-004', 'Addis Software', 'Addis Software Solutions', 'Software Development', 'Technology Zone', 'Software Development', 'contact@addissoftware.et', '+251-11-456-7890', 'Henok Tsegaye', 'henok@addissoftware.et', '+251-911-456789', 'Addis Ababa, Ethiopia', 'Building 2', 'Floor 2', 'Unit 201-202', 'active', 40, '{\"max_visitors\": 40, \"working_hours\": {\"start\": \"08:00\", \"end\": \"17:00\"}}', '{\"color\": \"#D90368\", \"theme\": \"corporate\"}', 11, '2025-10-24 08:22:41', '2025-10-29 09:06:02', NULL),
(5, 'TEN-005', 'Kazana Group', 'Kazana Group PLC', 'Financial Technology', 'Enterprise Zone', 'Financial Technology', 'info@kazanagroup.com', '+251-11-567-8901', 'Meron Estefanos', 'meron@kazanagroup.com', '+251-911-567890', 'Addis Ababa, Ethiopia', 'Building 3', 'Floor 1', 'Unit 101-102', 'active', 45, '{\"max_visitors\": 45, \"working_hours\": {\"start\": \"08:00\", \"end\": \"18:00\"}}', '{\"color\": \"#F18F01\", \"theme\": \"professional\"}', 12, '2025-10-24 08:22:41', '2025-10-29 09:06:02', NULL),
(34, 'TEN-AFR001', 'Africom', 'Africom', 'Technology', 'Technology Zone', 'Software Development', 'yesuf023@gmail.com', '+251923531946', 'Zelalem', 'yesuf023@gmail.com', '+251923531946', 'Sgffgdhjhjjsds', 'Building A', '2', '11', 'pending', 60, '{\"max_visitors\":25,\"max_employees\":60,\"working_hours\":{\"start\":\"08:00\",\"end\":\"18:00\"},\"timezone\":\"Africa/Addis_Ababa\",\"notifications\":{\"email_notifications\":true,\"sms_notifications\":false,\"push_notifications\":true},\"visitor_management\":{\"auto_approval\":true,\"require_documents\":false,\"visitor_badge_required\":true,\"photo_required\":false},\"material_management\":{\"approval_workflow\":true,\"tracking_enabled\":true,\"qr_code_generation\":true},\"access_control\":{\"multi_location_support\":true,\"role_based_access\":true,\"session_timeout\":8,\"password_policy\":{\"min_length\":8,\"require_special_chars\":true,\"require_numbers\":true,\"require_uppercase\":true}},\"integrations\":{\"api_access_enabled\":true,\"webhook_support\":true,\"third_party_integrations\":true,\"export_capabilities\":true},\"reporting\":{\"basic_reports\":true,\"advanced_analytics\":true,\"custom_reports\":true,\"scheduled_reports\":true,\"data_retention_days\":1095},\"customization\":{\"custom_branding_enabled\":true,\"custom_themes\":true,\"custom_fields\":true,\"white_labeling\":true}}', '{\"colors\":{\"primary\":\"#007bff\",\"secondary\":\"#6c757d\",\"success\":\"#28a745\",\"warning\":\"#ffc107\",\"danger\":\"#dc3545\",\"info\":\"#17a2b8\"},\"theme\":\"modern\",\"assets\":{\"logo\":null,\"favicon\":null,\"login_background\":null,\"email_header\":null},\"typography\":{\"font_family\":\"Inter, system-ui, sans-serif\",\"font_size_base\":\"14px\",\"heading_font_weight\":\"600\"},\"layout\":{\"sidebar_width\":\"250px\",\"header_height\":\"60px\",\"card_border_radius\":\"8px\",\"button_border_radius\":\"6px\"},\"custom_css\":\"\",\"email_templates\":{\"welcome_template\":\"default\",\"notification_template\":\"default\",\"approval_template\":\"default\"},\"messages\":{\"welcome_message\":\"Welcome to our facility\",\"footer_text\":\"Powered by VMMS\",\"contact_info\":null},\"color\":\"#0C7C92\",\"logo\":null}', NULL, '2025-10-29 10:42:44', '2025-10-29 10:42:44', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tenant_activity_logs`
--

CREATE TABLE `tenant_activity_logs` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `activity_type` varchar(50) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` varchar(36) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tenant_activity_logs`
--

INSERT INTO `tenant_activity_logs` (`id`, `tenant_id`, `user_id`, `activity_type`, `entity_type`, `entity_id`, `description`, `metadata`, `ip_address`, `user_agent`, `created_at`) VALUES
(1, 34, 1, 'tenant_created', 'tenant', '34', 'Tenant \"Africom\" created successfully', '{\"tenant_code\":\"TEN-AFR001\",\"has_admin\":true,\"users_created\":1,\"auto_generated_code\":true}', '127.0.0.1', NULL, '2025-10-29 10:42:44');

-- --------------------------------------------------------

--
-- Table structure for table `tenant_users`
--

CREATE TABLE `tenant_users` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `tenant_role` enum('admin','manager','operator','viewer','staff') NOT NULL DEFAULT 'viewer',
  `role_id` int(11) DEFAULT NULL,
  `position` varchar(100) DEFAULT NULL,
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`permissions`)),
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `can_approve_materials` tinyint(1) DEFAULT 0,
  `can_register_visitors` tinyint(1) DEFAULT 0,
  `can_record_materials` tinyint(1) DEFAULT 0,
  `can_view_reports` tinyint(1) DEFAULT 0,
  `can_manage_users` tinyint(1) DEFAULT 0,
  `can_update_profile` tinyint(1) DEFAULT 0,
  `is_primary` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `assigned_by` int(11) DEFAULT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tenant_users`
--

INSERT INTO `tenant_users` (`id`, `tenant_id`, `user_id`, `tenant_role`, `role_id`, `position`, `permissions`, `status`, `can_approve_materials`, `can_register_visitors`, `can_record_materials`, `can_view_reports`, `can_manage_users`, `can_update_profile`, `is_primary`, `is_active`, `assigned_by`, `assigned_at`, `deleted_at`, `created_at`, `updated_at`) VALUES
(1, 1, 13, 'admin', NULL, NULL, '{\"materials\":{\"view\":true,\"create\":true,\"edit\":true,\"delete\":true,\"approve\":true},\"visitors\":{\"view\":true,\"create\":true,\"edit\":true,\"delete\":true,\"checkin\":true,\"checkout\":true},\"users\":{\"view\":true,\"invite\":true,\"edit\":true,\"remove\":true},\"reports\":{\"view\":true,\"export\":true,\"analytics\":true},\"settings\":{\"view\":true,\"edit\":true,\"branding\":true}}', 'active', 0, 0, 0, 0, 0, 0, 0, 1, 1, '2025-10-24 08:22:41', NULL, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(2, 1, 14, 'manager', NULL, NULL, '{\"materials\":{\"view\":true,\"create\":true,\"edit\":true,\"delete\":false,\"approve\":true},\"visitors\":{\"view\":true,\"create\":true,\"edit\":true,\"delete\":false,\"checkin\":true,\"checkout\":true},\"users\":{\"view\":true,\"invite\":false,\"edit\":false,\"remove\":false},\"reports\":{\"view\":true,\"export\":true,\"analytics\":false},\"settings\":{\"view\":true,\"edit\":false,\"branding\":false}}', 'active', 0, 0, 0, 0, 0, 0, 0, 1, 13, '2025-10-24 08:22:41', NULL, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(3, 2, 9, 'admin', NULL, NULL, '{\"materials\":{\"view\":true,\"create\":true,\"edit\":true,\"delete\":true,\"approve\":true},\"visitors\":{\"view\":true,\"create\":true,\"edit\":true,\"delete\":true,\"checkin\":true,\"checkout\":true},\"users\":{\"view\":true,\"invite\":true,\"edit\":true,\"remove\":true},\"reports\":{\"view\":true,\"export\":true,\"analytics\":true},\"settings\":{\"view\":true,\"edit\":true,\"branding\":true}}', 'active', 0, 0, 0, 0, 0, 0, 0, 1, 1, '2025-10-24 08:22:41', NULL, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(4, 3, 10, 'admin', NULL, NULL, '{\"materials\":{\"view\":true,\"create\":true,\"edit\":true,\"delete\":true,\"approve\":true},\"visitors\":{\"view\":true,\"create\":true,\"edit\":true,\"delete\":false,\"checkin\":true,\"checkout\":true},\"users\":{\"view\":true,\"invite\":true,\"edit\":true,\"remove\":false},\"reports\":{\"view\":true,\"export\":true,\"analytics\":false},\"settings\":{\"view\":true,\"edit\":true,\"branding\":false}}', 'active', 0, 0, 0, 0, 0, 0, 0, 1, 1, '2025-10-24 08:22:41', NULL, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(5, 4, 11, 'admin', NULL, NULL, '{\"materials\":{\"view\":true,\"create\":true,\"edit\":true,\"delete\":true,\"approve\":true},\"visitors\":{\"view\":true,\"create\":true,\"edit\":true,\"delete\":false,\"checkin\":true,\"checkout\":true},\"users\":{\"view\":true,\"invite\":true,\"edit\":true,\"remove\":false},\"reports\":{\"view\":true,\"export\":true,\"analytics\":false},\"settings\":{\"view\":true,\"edit\":true,\"branding\":false}}', 'active', 0, 0, 0, 0, 0, 0, 0, 1, 1, '2025-10-24 08:22:41', NULL, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(6, 5, 12, 'admin', NULL, NULL, '{\"materials\":{\"view\":true,\"create\":true,\"edit\":true,\"delete\":true,\"approve\":true},\"visitors\":{\"view\":true,\"create\":true,\"edit\":true,\"delete\":false,\"checkin\":true,\"checkout\":true},\"users\":{\"view\":true,\"invite\":true,\"edit\":true,\"remove\":false},\"reports\":{\"view\":true,\"export\":true,\"analytics\":false},\"settings\":{\"view\":true,\"edit\":true,\"branding\":false}}', 'active', 0, 0, 0, 0, 0, 0, 0, 1, 1, '2025-10-24 08:22:41', NULL, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(7, 34, 22, 'manager', 3, 'Manager', '{\"materials\":{\"view\":true,\"create\":true,\"edit\":true,\"delete\":true,\"approve\":true},\"visitors\":{\"view\":true,\"create\":true,\"edit\":true,\"delete\":true,\"checkin\":true,\"checkout\":true},\"users\":{\"view\":true,\"invite\":true,\"edit\":true,\"remove\":true},\"reports\":{\"view\":true,\"export\":true,\"analytics\":true},\"settings\":{\"view\":true,\"edit\":true,\"branding\":true}}', 'active', 1, 1, 1, 1, 1, 1, 1, 1, 1, '2025-10-29 10:42:44', NULL, '2025-10-29 10:42:44', '2025-10-29 10:42:44');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `user_name` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role_id` int(11) DEFAULT NULL,
  `tenant_id` int(11) DEFAULT NULL,
  `user_type` enum('system','tenant','employee') DEFAULT 'employee',
  `is_primary` tinyint(1) DEFAULT 0,
  `avatar_url` varchar(500) DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `status` enum('active','inactive','locked') DEFAULT 'active',
  `online_flag` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `employee_id`, `user_name`, `password`, `role_id`, `tenant_id`, `user_type`, `is_primary`, `avatar_url`, `last_login`, `status`, `online_flag`, `created_at`, `updated_at`) VALUES
(1, 1, 'alemayehu.tadesse', '$2b$10$sm9Mv2LvGlHQ7K0ONqBlBubfG5j5S/pz8Xo52gq1r4efjmIb.LMdS', 1, NULL, 'employee', 0, NULL, NULL, 'active', 1, '2025-10-24 08:22:41', '2025-10-24 13:53:56'),
(2, 2, 'dawit.mekonnen', '$2b$10$sm9Mv2LvGlHQ7K0ONqBlBubfG5j5S/pz8Xo52gq1r4efjmIb.LMdS', 2, NULL, 'employee', 0, NULL, NULL, 'active', 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(3, 3, 'hanan.ahmed', '$2b$10$sm9Mv2LvGlHQ7K0ONqBlBubfG5j5S/pz8Xo52gq1r4efjmIb.LMdS', 2, NULL, 'employee', 0, NULL, NULL, 'active', 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(4, 4, 'tesfaye.bekele', '$2b$10$sm9Mv2LvGlHQ7K0ONqBlBubfG5j5S/pz8Xo52gq1r4efjmIb.LMdS', 5, NULL, 'employee', 0, NULL, NULL, 'active', 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(5, 5, 'meron.haile', '$2b$10$sm9Mv2LvGlHQ7K0ONqBlBubfG5j5S/pz8Xo52gq1r4efjmIb.LMdS', 5, NULL, 'employee', 0, NULL, NULL, 'active', 1, '2025-10-24 08:22:41', '2025-10-24 13:23:09'),
(6, 6, 'solomon.girma', '$2b$10$sm9Mv2LvGlHQ7K0ONqBlBubfG5j5S/pz8Xo52gq1r4efjmIb.LMdS', 9, NULL, 'employee', 0, NULL, NULL, 'active', 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(7, 7, 'tigist.assefa', '$2b$10$sm9Mv2LvGlHQ7K0ONqBlBubfG5j5S/pz8Xo52gq1r4efjmIb.LMdS', 6, NULL, 'employee', 0, NULL, NULL, 'active', 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(8, 8, 'bethlehem.worku', '$2b$10$sm9Mv2LvGlHQ7K0ONqBlBubfG5j5S/pz8Xo52gq1r4efjmIb.LMdS', 6, NULL, 'employee', 0, NULL, NULL, 'active', 0, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(9, 9, 'yohannes.desta', '$2b$10$sm9Mv2LvGlHQ7K0ONqBlBubfG5j5S/pz8Xo52gq1r4efjmIb.LMdS', 2, NULL, 'employee', 0, NULL, NULL, 'active', 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(10, 10, 'selamawit.teshome', '$2b$10$sm9Mv2LvGlHQ7K0ONqBlBubfG5j5S/pz8Xo52gq1r4efjmIb.LMdS', 8, NULL, 'employee', 0, NULL, NULL, 'active', 0, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(11, 11, 'mulugeta.abebe', '$2b$10$sm9Mv2LvGlHQ7K0ONqBlBubfG5j5S/pz8Xo52gq1r4efjmIb.LMdS', 8, NULL, 'employee', 0, NULL, NULL, 'active', 0, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(12, 12, 'getachew.lemma', '$2b$10$sm9Mv2LvGlHQ7K0ONqBlBubfG5j5S/pz8Xo52gq1r4efjmIb.LMdS', 8, NULL, 'employee', 0, NULL, NULL, 'active', 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(13, 13, 'rahel.negash', '$2b$10$sm9Mv2LvGlHQ7K0ONqBlBubfG5j5S/pz8Xo52gq1r4efjmIb.LMdS', 3, NULL, 'employee', 0, NULL, NULL, 'active', 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(14, 14, 'biniam.tekle', '$2b$10$sm9Mv2LvGlHQ7K0ONqBlBubfG5j5S/pz8Xo52gq1r4efjmIb.LMdS', 3, NULL, 'employee', 0, NULL, NULL, 'active', 0, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(15, 15, 'almaz.wolde', '$2b$10$sm9Mv2LvGlHQ7K0ONqBlBubfG5j5S/pz8Xo52gq1r4efjmIb.LMdS', 2, NULL, 'employee', 0, NULL, NULL, 'active', 1, '2025-10-24 08:22:41', '2025-10-24 08:22:41'),
(16, 16, 'hayal@gmail.co', '$2b$10$xkJzjGNy6F85E87zohFBaeyCxkOUSE4lvPEjMdcbkY5CibUCSA5Vu', 5, NULL, 'employee', 0, NULL, NULL, 'active', 1, '2025-10-25 06:53:55', '2025-10-25 06:56:37'),
(17, 17, 'hayaltamrat@gmail.com', '$2b$10$Pm/fVscIqsh2jbF6iZvJMuMQkoUrayrIN01WAtLO1Z5WFC.S0u0qW', 9, NULL, 'employee', 0, NULL, NULL, 'active', 1, '2025-10-26 08:30:08', '2025-10-26 08:46:39'),
(22, 42, 'africom.tenant', '$2b$12$JMhI5v.HpmVumpvHJ9BVS.FxB4Z2YNVbdSS9dY7LF8ZNhufDEWL1O', 3, 34, 'tenant', 1, NULL, NULL, 'active', 1, '2025-10-29 10:42:44', '2025-10-29 12:15:44');

-- --------------------------------------------------------

--
-- Table structure for table `visitors`
--

CREATE TABLE `visitors` (
  `id` varchar(36) NOT NULL,
  `visitor_number` varchar(50) NOT NULL,
  `name` varchar(200) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `company` varchar(200) DEFAULT NULL,
  `id_number` varchar(100) DEFAULT NULL,
  `id_type` enum('national_id','passport','driving_license','other') DEFAULT 'national_id',
  `nationality` varchar(100) DEFAULT 'Ethiopian',
  `purpose` varchar(500) DEFAULT NULL,
  `host_id` int(11) DEFAULT NULL,
  `tenant_id` int(11) DEFAULT NULL,
  `status` enum('pre_registered','approved','checked_in','checked_out','expired','cancelled','rejected') DEFAULT 'pre_registered',
  `visit_date` date DEFAULT NULL,
  `expected_duration` int(11) DEFAULT NULL,
  `check_in_time` timestamp NULL DEFAULT NULL,
  `check_out_time` timestamp NULL DEFAULT NULL,
  `actual_duration` int(11) DEFAULT NULL,
  `escort_required` tinyint(1) DEFAULT 0,
  `security_clearance` enum('none','basic','medium','high') DEFAULT 'none',
  `vehicle_registration` varchar(50) DEFAULT NULL,
  `emergency_contact_name` varchar(200) DEFAULT NULL,
  `emergency_contact_phone` varchar(20) DEFAULT NULL,
  `photo_url` varchar(500) DEFAULT NULL,
  `badge_number` varchar(50) DEFAULT NULL,
  `access_areas` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`access_areas`)),
  `qr_code` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `visitor_timeline`
--

CREATE TABLE `visitor_timeline` (
  `id` int(11) NOT NULL,
  `visitor_id` varchar(36) NOT NULL,
  `action` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_entity_type` (`entity_type`);

--
-- Indexes for table `approvals`
--
ALTER TABLE `approvals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_entity_type` (`entity_type`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`department_id`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`employee_id`),
  ADD UNIQUE KEY `unique_email` (`email`),
  ADD KEY `idx_role_id` (`role_id`),
  ADD KEY `idx_department_id` (`department_id`),
  ADD KEY `idx_tenant_id` (`tenant_id`);

--
-- Indexes for table `materials`
--
ALTER TABLE `materials`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_tracking_number` (`tracking_number`),
  ADD KEY `idx_tenant_id` (`tenant_id`),
  ADD KEY `idx_created_by` (`created_by`),
  ADD KEY `idx_approved_by` (`approved_by`),
  ADD KEY `idx_deleted_at` (`deleted_at`),
  ADD KEY `fk_materials_checked_in_by` (`checked_in_by`),
  ADD KEY `fk_materials_checked_out_by` (`checked_out_by`),
  ADD KEY `idx_materials_checked_in` (`checked_in`),
  ADD KEY `idx_materials_checked_out` (`checked_out`),
  ADD KEY `idx_materials_gust_id` (`gust_id`),
  ADD KEY `idx_materials_is_gust_entry` (`is_gust_entry`);

--
-- Indexes for table `material_items`
--
ALTER TABLE `material_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_material_id` (`material_id`);

--
-- Indexes for table `material_timeline`
--
ALTER TABLE `material_timeline`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_material_id` (`material_id`);

--
-- Indexes for table `menu_items`
--
ALTER TABLE `menu_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_parent_id` (`parent_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`),
  ADD UNIQUE KEY `unique_role_name` (`role_name`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_role_menu` (`role_id`,`menu_item_id`),
  ADD KEY `fk_permission_menu` (`menu_item_id`);

--
-- Indexes for table `tenants`
--
ALTER TABLE `tenants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_tenant_code` (`tenant_code`),
  ADD UNIQUE KEY `unique_email` (`email`),
  ADD KEY `idx_tenants_deleted_at` (`deleted_at`),
  ADD KEY `idx_primary_admin` (`primary_admin_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_business_type` (`business_type`),
  ADD KEY `idx_zone` (`zone`),
  ADD KEY `idx_category` (`category`);

--
-- Indexes for table `tenant_activity_logs`
--
ALTER TABLE `tenant_activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tenant_id` (`tenant_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_activity_type` (`activity_type`),
  ADD KEY `idx_entity_type` (`entity_type`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `tenant_users`
--
ALTER TABLE `tenant_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_tenant_user_active` (`tenant_id`,`user_id`,`deleted_at`),
  ADD KEY `idx_tenant_id` (`tenant_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_tenant_role` (`tenant_role`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_assigned_by` (`assigned_by`),
  ADD KEY `idx_deleted_at` (`deleted_at`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `unique_user_name` (`user_name`),
  ADD KEY `idx_employee_id` (`employee_id`),
  ADD KEY `idx_role_id` (`role_id`),
  ADD KEY `idx_tenant_id` (`tenant_id`);

--
-- Indexes for table `visitors`
--
ALTER TABLE `visitors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_visitor_number` (`visitor_number`),
  ADD KEY `idx_tenant_id` (`tenant_id`),
  ADD KEY `idx_host_id` (`host_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_visit_date` (`visit_date`),
  ADD KEY `idx_created_by` (`created_by`),
  ADD KEY `idx_approved_by` (`approved_by`);

--
-- Indexes for table `visitor_timeline`
--
ALTER TABLE `visitor_timeline`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_visitor_id` (`visitor_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_log`
--
ALTER TABLE `activity_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT for table `approvals`
--
ALTER TABLE `approvals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `department_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `employee_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `material_items`
--
ALTER TABLE `material_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `material_timeline`
--
ALTER TABLE `material_timeline`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

--
-- AUTO_INCREMENT for table `menu_items`
--
ALTER TABLE `menu_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `role_permissions`
--
ALTER TABLE `role_permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=503;

--
-- AUTO_INCREMENT for table `tenants`
--
ALTER TABLE `tenants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `tenant_activity_logs`
--
ALTER TABLE `tenant_activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tenant_users`
--
ALTER TABLE `tenant_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `visitor_timeline`
--
ALTER TABLE `visitor_timeline`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `fk_employee_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_employee_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_employee_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `materials`
--
ALTER TABLE `materials`
  ADD CONSTRAINT `fk_material_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_material_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_material_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_materials_checked_in_by` FOREIGN KEY (`checked_in_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_materials_checked_out_by` FOREIGN KEY (`checked_out_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `material_items`
--
ALTER TABLE `material_items`
  ADD CONSTRAINT `fk_material_item` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `material_timeline`
--
ALTER TABLE `material_timeline`
  ADD CONSTRAINT `fk_timeline_material` FOREIGN KEY (`material_id`) REFERENCES `materials` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `menu_items`
--
ALTER TABLE `menu_items`
  ADD CONSTRAINT `fk_menu_parent` FOREIGN KEY (`parent_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `fk_permission_menu` FOREIGN KEY (`menu_item_id`) REFERENCES `menu_items` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_permission_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE;

--
-- Constraints for table `tenants`
--
ALTER TABLE `tenants`
  ADD CONSTRAINT `fk_primary_admin` FOREIGN KEY (`primary_admin_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `tenant_activity_logs`
--
ALTER TABLE `tenant_activity_logs`
  ADD CONSTRAINT `fk_tenant_activity_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_tenant_activity_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `tenant_users`
--
ALTER TABLE `tenant_users`
  ADD CONSTRAINT `fk_tenant_users_assigned_by` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_tenant_users_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_tenant_users_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_user_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_user_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_user_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `visitors`
--
ALTER TABLE `visitors`
  ADD CONSTRAINT `fk_visitor_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_visitor_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_visitor_host` FOREIGN KEY (`host_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_visitor_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `visitor_timeline`
--
ALTER TABLE `visitor_timeline`
  ADD CONSTRAINT `fk_visitor_timeline` FOREIGN KEY (`visitor_id`) REFERENCES `visitors` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
