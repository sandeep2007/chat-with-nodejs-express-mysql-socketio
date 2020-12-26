-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 26, 2020 at 03:23 PM
-- Server version: 10.4.14-MariaDB
-- PHP Version: 7.4.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `livechat`
--

-- --------------------------------------------------------

--
-- Table structure for table `ch_chat`
--

CREATE TABLE `ch_chat` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `sender_id` bigint(20) UNSIGNED NOT NULL,
  `receiver_id` bigint(20) UNSIGNED NOT NULL,
  `message` varbinary(2000) NOT NULL,
  `is_seen` int(11) NOT NULL,
  `date_created` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `ch_chat`
--

INSERT INTO `ch_chat` (`id`, `sender_id`, `receiver_id`, `message`, `is_seen`, `date_created`) VALUES
(1, 1, 2, 0xd9998d50fdeb6516bd27c90f76757da4, 1, '2020-12-26 19:50:46'),
(2, 2, 1, 0x64161a1f9b2a6bb9ebe369ab69a06228, 1, '2020-12-26 19:50:50'),
(3, 2, 1, 0x7e7972ae310fd0ba57826cc1cbfff293, 1, '2020-12-26 19:50:58');

-- --------------------------------------------------------

--
-- Table structure for table `ch_last_seen`
--

CREATE TABLE `ch_last_seen` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `action` varchar(10) NOT NULL,
  `date_created` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `ch_last_seen`
--

INSERT INTO `ch_last_seen` (`id`, `user_id`, `action`, `date_created`) VALUES
(1, 1, 'LOGIN', '2020-12-26 19:50:32'),
(2, 2, 'LOGIN', '2020-12-26 19:50:41');

-- --------------------------------------------------------

--
-- Table structure for table `ch_socket_users`
--

CREATE TABLE `ch_socket_users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `token` varchar(100) NOT NULL,
  `socket_id` varchar(100) NOT NULL,
  `date_created` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `ch_socket_users`
--

INSERT INTO `ch_socket_users` (`id`, `token`, `socket_id`, `date_created`) VALUES
(1, '589623', '3M6w0EpLVIu2gY_DAAAA', '2020-12-26 19:50:32'),
(2, '369852', 'VGqURWQOTwMtCGaDAAAB', '2020-12-26 19:50:41');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(10) NOT NULL,
  `name` varchar(50) NOT NULL,
  `image` varchar(500) NOT NULL,
  `date_created` varchar(50) NOT NULL,
  `auth_key` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `name`, `image`, `date_created`, `auth_key`) VALUES
(1, 'user1@mail.com', '123', 'User 1', 'profile.jpg', '2020-11-27 12:00:00', '589623'),
(2, 'user2@mail.com', '123', 'User 2', 'profile.jpg', '2020-11-27 12:00:00', '369852'),
(3, 'user3@mail.com', '123', 'User 3', 'profile.jpg', '2020-11-27 12:00:00', '123456'),
(4, 'user4@mail.com', '123', 'User 4', 'profile.jpg', '2020-11-27 12:00:00', '654321');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ch_chat`
--
ALTER TABLE `ch_chat`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ch_last_seen`
--
ALTER TABLE `ch_last_seen`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ch_socket_users`
--
ALTER TABLE `ch_socket_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`,`socket_id`),
  ADD KEY `socket_id` (`socket_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`auth_key`),
  ADD KEY `email` (`email`),
  ADD KEY `password` (`password`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ch_chat`
--
ALTER TABLE `ch_chat`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `ch_last_seen`
--
ALTER TABLE `ch_last_seen`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `ch_socket_users`
--
ALTER TABLE `ch_socket_users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
