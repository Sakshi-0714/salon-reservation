-- MySQL dump 10.13  Distrib 9.6.0, for Win64 (x86_64)
--
-- Host: localhost    Database: salon_db
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `appointment_date` date NOT NULL,
  `appointment_time` time NOT NULL,
  `services` json NOT NULL,
  `paid_advance` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `pay_in_person` tinyint(1) DEFAULT '0',
  `payment_status` varchar(50) DEFAULT 'Pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `razorpay_order_id` varchar(255) DEFAULT NULL,
  `razorpay_payment_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
INSERT INTO `appointments` VALUES (12,6,'2026-04-21','17:19:00','[{\"name\": \"Cleanup - Cleanup\", \"price\": 600, \"status\": \"Cancelled\"}, {\"name\": \"Detan - Face Detan\", \"price\": 500, \"status\": \"Cancelled\"}]',0,'2026-04-11 08:45:29',1,'Pending',NULL,NULL,NULL),(13,8,'2026-04-15','17:45:00','[{\"name\": \"Face Massage - Face Massage\", \"price\": 400, \"status\": \"Cancelled\", \"emailSent\": true}, {\"name\": \"Styling - Blow Dry\", \"price\": 400, \"status\": \"Cancelled\"}]',0,'2026-04-11 09:13:43',0,'Pending',NULL,NULL,NULL),(24,1,'2026-07-30','12:00:00','[{\"name\": \"Styling\", \"price\": 50, \"status\": \"Completed\", \"emailSent\": true, \"assigned_staff\": \"Unassigned\"}]',0,'2026-04-24 05:01:55',0,'Pending',NULL,NULL,NULL),(25,2,'2026-04-29','10:00:00','[{\"name\": \"Body Polishing - Body Polishing\", \"price\": 2500, \"status\": \"Cancelled\", \"emailSent\": true, \"assigned_staff\": \"Tanvi Kadam\"}]',0,'2026-04-28 14:35:42',1,'Pending',NULL,NULL,NULL),(26,2,'2026-04-29','01:15:00','[{\"name\": \"Hair Spa - Basic Hair Spa\", \"price\": 900, \"status\": \"Completed\", \"emailSent\": true, \"assigned_staff\": \"Riya Shintre\"}]',0,'2026-04-28 15:41:57',0,'Pending',NULL,NULL,NULL),(27,4,'2026-04-29','01:05:00','[{\"name\": \"Face Massage - Face Massage\", \"price\": 400, \"status\": \"Completed\", \"emailSent\": true, \"assigned_staff\": \"Shreya Kori\"}, {\"name\": \"Body Polishing - Body Polishing\", \"price\": 2500, \"status\": \"Completed\", \"assigned_staff\": \"Tanvi Kadam\"}]',1,'2026-04-28 16:00:01',1,'Paid','Razorpay','order_SmLL2QBgehJ3DH','pay_SmLLa577mZZ2yw'),(28,2,'2026-04-28','10:20:00','[{\"name\": \"Airbrush Makeup - Airbrush Makeup\", \"price\": 15000, \"status\": \"Completed\", \"emailSent\": true, \"assigned_staff\": \"Kritika Bable\"}]',0,'2026-04-28 16:14:46',0,'Pending',NULL,NULL,NULL),(29,2,'2026-04-28','01:50:00','[{\"name\": \"Hair Spa - Basic Hair Spa\", \"price\": 900, \"status\": \"Completed\", \"emailSent\": true, \"assigned_staff\": \"Riya Shintre\"}]',0,'2026-04-28 16:16:59',0,'Pending',NULL,NULL,NULL),(30,2,'2026-05-03','20:50:00','[{\"name\": \"Haircut - Trim\", \"price\": 250, \"status\": \"Completed\", \"emailSent\": true, \"assigned_staff\": \"Anjali Patil\"}]',1,'2026-05-01 09:11:59',0,'Paid','Razorpay','order_Sk33bMruUTpQnu','pay_Sk3ARKezrJ1JOU'),(31,2,'2026-05-02','20:10:00','[{\"name\": \"Threading - Forehead\", \"price\": 30, \"status\": \"Completed\", \"assigned_staff\": \"Komal Patil\"}]',1,'2026-05-01 09:36:11',0,'Paid','Razorpay','order_SktMcGufzicFOg','pay_SktMltcnDMXjcm'),(39,2,'2026-05-09','15:00:00','[{\"name\": \"Body Spa - Body Spa\", \"price\": 2500, \"status\": \"Cancelled\", \"assigned_staff\": \"Deepika Dhangar\"}]',0,'2026-05-07 05:20:45',0,'Pending',NULL,NULL,NULL),(40,4,'2026-05-10','20:15:00','[{\"name\": \"Keratin - Keratin Treatment\", \"price\": 3500, \"status\": \"Approved\", \"emailSent\": true, \"assigned_staff\": \"Riya More\"}]',1,'2026-05-09 09:42:47',0,'Paid','Razorpay','order_SnDipjuPwOOe94','pay_SnDizDpVFU8zJ4');
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bills`
--

DROP TABLE IF EXISTS `bills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bills` (
  `id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `bill_number` varchar(50) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `payment_status` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `appointment_id` (`appointment_id`),
  CONSTRAINT `bills_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bills`
--

LOCK TABLES `bills` WRITE;
/*!40000 ALTER TABLE `bills` DISABLE KEYS */;
INSERT INTO `bills` VALUES (1,27,'BILL-AUTO-1778128558013-27',2900.00,'Paid','2026-05-07 04:35:58'),(2,31,'BILL-AUTO-1778128628648-31',30.00,'Paid','2026-05-07 04:37:08'),(3,28,'BILL-1778128699567-28',15000.00,'Pending','2026-05-07 04:38:19'),(4,30,'BILL-AUTO-1778129533410-30',250.00,'Paid','2026-05-07 04:52:13'),(6,40,'8463588963',3500.00,'Paid','2026-05-09 09:44:01');
/*!40000 ALTER TABLE `bills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `service` varchar(100) DEFAULT NULL,
  `booking_date` date DEFAULT NULL,
  `booking_time` time DEFAULT NULL,
  `status` varchar(20) DEFAULT 'pending',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otps`
--

DROP TABLE IF EXISTS `otps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `otps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `otp` varchar(10) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otps`
--

LOCK TABLES `otps` WRITE;
/*!40000 ALTER TABLE `otps` DISABLE KEYS */;
/*!40000 ALTER TABLE `otps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `user_name` varchar(100) NOT NULL,
  `service_name` varchar(100) NOT NULL,
  `rating` int NOT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,NULL,'Sakshi Patankar','Hair Spa',4,'overall good experience','2026-04-28 15:55:55'),(2,NULL,'Poorva','Face Massage & Body Polishing',5,'','2026-04-28 16:03:50'),(4,4,'Poorva','Face Massage & Body Polishing',5,'service was good','2026-05-09 09:44:36');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `image_url` text,
  `lat` decimal(10,8) DEFAULT NULL,
  `lng` decimal(11,8) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `assigned_staff` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES (1,'Hair Services','Haircut','Trim: ₹250, Straight Cut (One Length): ₹350, U-Cut: ₹500, V-Cut: ₹600, Layer Cut: ₹500, Long Layers: ₹600, Step Cut: ₹600, Feather Cut: ₹600, Butterfly Cut: ₹500, Face-Framing Layers: ₹600, Boy Cut: ₹300, Classic Bob: ₹520, Lob (Long Bob): ₹500, Pixie Cut: ₹450, Wolf Cut: ₹650',0.00,NULL,40.71280000,-74.00600000,'123 Wellness Ave, NY','Anjali Patil'),(2,'Hair Services','Styling','Blow Dry: ₹400, Curls: ₹800, Straightening: ₹1200',0.00,NULL,40.71280000,-74.00600000,'123 Wellness Ave, NY','Sneha Jadhav'),(3,'Hair Services','Hair Wash & Conditioning','Hair Wash: ₹150, Conditioning: ₹250',0.00,NULL,40.71280000,-74.00600000,'123 Wellness Ave, NY','Pooja Shinde'),(4,'Hair Services','Hair Spa','Basic Hair Spa: ₹900, Premium Hair Spa: ₹1500',0.00,NULL,40.71280000,-74.00600000,'123 Wellness Ave, NY','Riya Shintre'),(5,'Hair Services','Hair Coloring','Global Color: ₹1500, Highlights: ₹900, Balayage: ₹3500',0.00,NULL,40.71280000,-74.00600000,'123 Wellness Ave, NY','Priya Chavan'),(6,'Hair Services','Keratin','Keratin Treatment: ₹3500',3500.00,NULL,40.71280000,-74.00600000,'123 Wellness Ave, NY','Riya More'),(7,'Skin / Face Services','Facial','Fruit Facial: ₹700, Gold Facial: ₹800, Diamond Facial: ₹900, Anti-aging Facial: ₹1000',0.00,NULL,40.75890000,-73.98510000,'456 Calm Street, NY','Kavya Gowda'),(8,'Skin / Face Services','Cleanup','Cleanup: ₹600',600.00,NULL,40.75890000,-73.98510000,'456 Calm Street, NY','Aishwarya Naik'),(9,'Skin / Face Services','Bleach','Face Bleach: ₹400, Full Body Bleach: ₹900',0.00,NULL,40.75890000,-73.98510000,'456 Calm Street, NY','Swati Reddy'),(10,'Skin / Face Services','Detan','Face Detan: ₹500, Full Body Detan: ₹1300',0.00,NULL,40.75890000,-73.98510000,'456 Calm Street, NY','Nisha Madar'),(11,'Skin / Face Services','Threading','Eyebrows: ₹40, Upper Lips: ₹30, Forehead: ₹30',0.00,NULL,40.75890000,-73.98510000,'456 Calm Street, NY','Komal Patil'),(12,'Skin / Face Services','Face Massage','Face Massage: ₹400',400.00,NULL,40.75890000,-73.98510000,'456 Calm Street, NY','Shreya Kori'),(13,'Body Services','Waxing','Honey Wax Full Body: ₹1500, Honey Wax Arms: ₹250, Honey Wax Legs: ₹350, Honey Wax Underarms: ₹80, Rica Wax Full Body: ₹2500',0.00,NULL,40.73060000,-73.93520000,'123 Wellness Ave, NY',NULL),(14,'Body Services','Body Polishing','Body Polishing: ₹2500',2500.00,NULL,40.73060000,-73.93520000,'123 Wellness Ave, NY','Tanvi Kadam'),(15,'Body Services','Body Spa','Body Spa: ₹2500',2500.00,NULL,40.73060000,-73.93520000,'123 Wellness Ave, NY','Deepika Dhangar'),(16,'Body Services','Body Massage','Basic Massage: ₹1200, Aromatherapy / Swedish: ₹2000',0.00,NULL,40.73060000,-73.93520000,'123 Wellness Ave, NY','Bhavna Kamble'),(17,'Makeup Services','Party Makeup','Party Makeup: ₹3000',3000.00,NULL,40.75490000,-73.98400000,'456 Calm Street, NY','Radhika Gowda'),(18,'Makeup Services','Engagement Makeup','Engagement Makeup: ₹6000',6000.00,NULL,40.75490000,-73.98400000,'456 Calm Street, NY','Simran Patil'),(19,'Makeup Services','Bridal Makeup','Bridal Makeup: ₹12000',12000.00,NULL,40.75490000,-73.98400000,'456 Calm Street, NY','Pooja Jadhav'),(20,'Makeup Services','Airbrush Makeup','Airbrush Makeup: ₹15000',15000.00,NULL,40.75490000,-73.98400000,'456 Calm Street, NY',NULL);
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS `staff`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staff` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `assigned_service` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staff`
--

LOCK TABLES `staff` WRITE;
/*!40000 ALTER TABLE `staff` DISABLE KEYS */;
INSERT INTO `staff` VALUES (1,'Anjali Patil','Haircut','8676543210','Tilakwadi, Belagavi','Active','2026-04-23 05:01:28'),(2,'Sneha Jadhav','Styling','9876543211','Shahapur, Belagavi','Active','2026-04-23 05:01:28'),(3,'Pooja Shinde','Hair Wash & Conditioning','7596543212','Raviwar Peth, Belagavi','Inactive','2026-04-23 05:01:28'),(5,'Priya Chavan','Hair Coloring','8879543214','Mahantesh Nagar, Belagavi','Active','2026-04-23 05:01:28'),(6,'Riya More','Keratin','9874593215','Vadgaon, Belagavi','Active','2026-04-23 05:01:28'),(7,'Kavya Gowda','Facial','9876543216','RPD Cross, Belagavi','Active','2026-04-23 05:01:28'),(8,'Aishwarya Naik','Cleanup','8176543217','Camp, Belagavi','Active','2026-04-23 05:01:28'),(9,'Swati Reddy','Bleach','9876543218','Sadashiv Nagar, Belagavi','Active','2026-04-23 05:01:28'),(10,'Nisha Madar','Detan','9876543219','Udyambag, Belagavi','Active','2026-04-23 05:01:28'),(11,'Komal Patil','Threading','9876543220','Hindwadi, Belagavi','Active','2026-04-23 05:01:28'),(12,'Shreya Kori','Face Massage','9876543221','Khasbag, Belagavi','Active','2026-04-23 05:01:28'),(13,'Meena Khot','Waxing','9876543222','Hanuman Nagar, Belagavi','Active','2026-04-23 05:01:28'),(14,'Tanvi Kadam','Body Polishing','9876543223','Auto Nagar, Belagavi','Active','2026-04-23 05:01:28'),(15,'Deepika Dhangar','Body Spa','9876543224','Nehru Nagar, Belagavi','Active','2026-04-23 05:01:28'),(16,'Bhavna Kamble','Body Massage','9876543225','Peeranwadi, Belagavi','Active','2026-04-23 05:01:28'),(17,'Radhika Gowda','Party Makeup','9876543226','Khade Bazar, Belagavi','Active','2026-04-23 05:01:28'),(18,'Simran Patil','Engagement Makeup','9876543227','Bhagya Nagar, Belagavi','Active','2026-04-23 05:01:28'),(19,'Pooja Jadhav','Bridal Makeup','9876543228','Subhash Nagar, Belagavi','Active','2026-04-23 05:01:28'),(20,'Kritika Bable','Airbrush Makeup','9876543229','Fort Road, Belagavi','Active','2026-04-23 05:01:28'),(21,'Riya Shintre','Hair Spa','8468129846','RC Nagar','Active','2026-04-24 04:08:33');
/*!40000 ALTER TABLE `staff` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `phone` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Poorva Patankar','poorvapatankar04@gmail.com','$2b$10$gCFBgykFck5Co9mnQk8O6eUe662pBwUMFATXcLqbG44fSuTBLeTru','admin','2026-04-06 05:32:12',NULL),(2,'Sakshi Patankar','sakshipatankar04@gmail.com','$2b$10$cvWU2Xky4/a4KMboF/2fHutrK3vj3S4NoQMYce.gwbTOeL3hB6Bwq','user','2026-04-06 05:38:30','8073839867'),(3,'Admin','admin04@gmail.com','$2b$10$q/llk/kq/waC/lWpFvKyfOsVVKDkc560ag16qutVmkAX077mwYG8O','admin','2026-04-06 14:10:25',NULL),(4,'Poorva','patankarpoorva@gmail.com','$2b$10$6Dh8vQ8R8SrhKzQuwstxgOpGfENvL6GKFJzCrrQ1iX1Cbryoap3c.','user','2026-04-07 06:27:43','8463588963'),(5,'Admin','admin@gmail.com','$2b$10$avX8rQ4IDfcU8.QEnOgM3O3bfVs4J.dBVSHQvMWgjRQApbZybWeyK','admin','2026-04-09 04:38:51',NULL),(6,'Rohit','rohitjadhav1512004@gmail.com','$2b$10$t1eeqUybY5h7QCJ/zCuiOOhTfh5mt6LBpa0DL8ICdVnL.Ll9E294.','user','2026-04-11 08:21:36','8431685553'),(7,'Priya K','rjjrohitjadhav@gmail.com','$2b$10$Gf5v09tsOIZL/ggIn3LvHeVwv4P9HzOQbXn/26SWf/W4xrenjuhNO','user','2026-04-11 08:35:53','8431685553'),(8,'Priya K','priyakulkarni864@gmail.com','$2b$10$Q0R1RXtbkXUn0JW4RGytveO.btl2z.kp14sJwVXYVTSwltsby5LOq','user','2026-04-11 09:08:39','8996422366'),(9,'Sakshi','patankarsakshi07@gmail.com','$2b$10$2GDl9o5lms88gvv52Cj/9.5vWEka5Ja/tcc3f95PLkZclsDXiZ1Vu','user','2026-04-22 03:44:22','8073839867'),(10,'Farheen','jfarheen815@gmail.com','$2b$10$YeiGZwKQkKazIWImhf0Mgebhtm3AhzfCaeICHOVYteUt2IUPItZv.','user','2026-05-08 12:41:28','7869648133');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `verification_codes`
--

DROP TABLE IF EXISTS `verification_codes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `verification_codes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `code` varchar(6) NOT NULL,
  `expires_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `verification_codes`
--

LOCK TABLES `verification_codes` WRITE;
/*!40000 ALTER TABLE `verification_codes` DISABLE KEYS */;
/*!40000 ALTER TABLE `verification_codes` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-10 15:58:08
