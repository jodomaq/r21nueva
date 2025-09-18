/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.7.2-MariaDB, for Win64 (AMD64)
--
-- Host: cecytemich.edu.mx    Database: r21db25
-- ------------------------------------------------------
-- Server version	10.11.14-MariaDB-0+deb12u2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `committee`
--

DROP TABLE IF EXISTS `committee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `committee` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `section_number` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  `owner_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `owner_id` (`owner_id`),
  KEY `ix_committee_type` (`type`),
  KEY `ix_committee_section_number` (`section_number`),
  KEY `ix_committee_created_at` (`created_at`),
  CONSTRAINT `committee_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `committee`
--

LOCK TABLES `committee` WRITE;
/*!40000 ALTER TABLE `committee` DISABLE KEYS */;
INSERT INTO `committee` VALUES
(3,'Lopez Mateos','1225','Transportistas',1,'2025-09-17 02:23:58');
/*!40000 ALTER TABLE `committee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `committeedocument`
--

DROP TABLE IF EXISTS `committeedocument`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `committeedocument` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `content_type` varchar(255) NOT NULL,
  `size` int(11) NOT NULL,
  `committee_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_committeedocument_committee_id` (`committee_id`),
  CONSTRAINT `committeedocument_ibfk_1` FOREIGN KEY (`committee_id`) REFERENCES `committee` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `committeedocument`
--

LOCK TABLES `committeedocument` WRITE;
/*!40000 ALTER TABLE `committeedocument` DISABLE KEYS */;
INSERT INTO `committeedocument` VALUES
(1,'committees\\3\\93192239ef644a55a5e808c02e50a63c.png','urbana.png','image/png',195536,3,'2025-09-17 02:25:12'),
(3,'committees\\3\\d2a33f0768974323b6fe93b9e8f317aa.png','ninos.png','image/png',208809,3,'2025-09-17 02:42:25'),
(4,'committees/3/9912ff1f6e8147db823dee78e0afef53.jpg','image.jpg','image/jpeg',3543703,3,'2025-09-17 17:56:19');
/*!40000 ALTER TABLE `committeedocument` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `committeemember`
--

DROP TABLE IF EXISTS `committeemember`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `committeemember` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) NOT NULL,
  `ine_key` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `section_number` varchar(255) NOT NULL,
  `invited_by` varchar(255) NOT NULL,
  `committee_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_committeemember_committee_id` (`committee_id`),
  KEY `ix_committeemember_ine_key` (`ine_key`),
  CONSTRAINT `committeemember_ibfk_1` FOREIGN KEY (`committee_id`) REFERENCES `committee` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `committeemember`
--

LOCK TABLES `committeemember` WRITE;
/*!40000 ALTER TABLE `committeemember` DISABLE KEYS */;
INSERT INTO `committeemember` VALUES
(21,'María Elena Rodríguez Hernández','ROHE850312MDFDRR09','4431256789','maria.rodriguez@gmail.com','1226','Carlos Mendoza',3,'2025-09-17 02:23:58'),
(22,'José Antonio García López','GALJ790521HDFPRR05','4439871234','jose.garcia@hotmail.com','1227','Ana Morales',3,'2025-09-17 02:23:58'),
(23,'Francisco Javier Herrera Jiménez','HEJF880415HDFRJR08','4432145678','francisco.herrera@yahoo.com','1228','Roberto Vázquez',3,'2025-09-17 02:23:58'),
(24,'Carmen Guadalupe Sánchez Torres','SATC920708MDFNRR06','4438765432','carmen.sanchez@outlook.com','1229','Luis Martín',3,'2025-09-17 02:23:58'),
(25,'Ricardo Alberto Pérez Ramírez','PERR751230HDFMCR03','4435432189','ricardo.perez@gmail.com','1230','Patricia Ruiz',3,'2025-09-17 02:23:58'),
(26,'Alejandra Beatriz Castillo Moreno','CAMA861127MDFSTR04','4434567890','alejandra.castillo@gmail.com','1231','Diego Flores',3,'2025-09-17 02:23:58'),
(27,'Miguel Ángel Romero Villanueva','ROVM701018HDFMLG07','4437890123','miguel.romero@yahoo.com','1232','Sofía Ramírez',3,'2025-09-17 02:23:58'),
(28,'Elena Patricia González Nuñez','GONE940225MDFNRL08','4436789012','elena.gonzalez@hotmail.com','1233','Fernando Jiménez',3,'2025-09-17 02:23:58'),
(29,'Arturo Iván López Medina','LOMA830617HDFPDR01','4433210987','arturo.lopez@outlook.com','1234','Marcela Torres',3,'2025-09-17 02:23:58');
/*!40000 ALTER TABLE `committeemember` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `picture_url` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_user_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES
(1,'jodomaq@gmail.com','Donato Maldonado','https://lh3.googleusercontent.com/a/ACg8ocLnBi3-qXve3eqVap_6XccG0vbaK4B6qGQ0mJogxrf6BqFk6Uq1=s96-c','2025-09-16 23:31:59');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'r21db25'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2025-09-18 10:04:10
