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
-- Table structure for table `administrativeunit`
--

DROP TABLE IF EXISTS `administrativeunit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `administrativeunit` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) DEFAULT NULL,
  `unit_type` varchar(255) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_administrativeunit_code` (`code`),
  KEY `ix_administrativeunit_unit_type` (`unit_type`),
  KEY `ix_administrativeunit_name` (`name`),
  KEY `ix_administrativeunit_created_at` (`created_at`),
  KEY `ix_administrativeunit_parent_id` (`parent_id`),
  CONSTRAINT `administrativeunit_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `administrativeunit` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `administrativeunit`
--

LOCK TABLES `administrativeunit` WRITE;
/*!40000 ALTER TABLE `administrativeunit` DISABLE KEYS */;
INSERT INTO `administrativeunit` VALUES
(1,'Region Meseta','R1_meseta','Region',NULL,'2027-03-09 00:00:00');
/*!40000 ALTER TABLE `administrativeunit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `provider` varchar(20) NOT NULL,
  `provider_user_id` varchar(128) NOT NULL,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `device_id` varchar(128) NOT NULL,
  `user_agent` varchar(255) NOT NULL,
  `ip` varchar(255) DEFAULT NULL,
  `latitude` decimal(9,6) DEFAULT NULL,
  `longitude` decimal(9,6) DEFAULT NULL,
  `accuracy` int(11) DEFAULT NULL,
  `timezone` varchar(64) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_attendance_email` (`email`),
  KEY `ix_attendance_created_at` (`created_at`),
  KEY `ix_attendance_device_id` (`device_id`),
  KEY `ix_attendance_provider_user_id` (`provider_user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
INSERT INTO `attendance` VALUES
(1,'google','100023139683912578330','jodomaq@gmail.com','Donato Maldonado','e1e258d8b72e00cc012b7ae0584c1d71678627b61db8b79c52fe1362f1d8120e','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','189.203.97.141',20.637286,-103.399424,457374,'America/Mexico_City','2025-09-21 23:35:55'),
(2,'google','101830356115384258922','rquevedo@umich.mx','Roberto Carlos Quevedo Diaz','c0a6f884c9d1a64e65f78d61b132ac84e1fd6446d21d66a0ebc02b825b31479b','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15','38.7.20.73',19.821847,-101.041102,35,'America/Mexico_City','2025-09-23 00:06:22'),
(3,'google','100023139683912578330','jodomaq@gmail.com','Donato Maldonado','e1e258d8b72e00cc012b7ae0584c1d71678627b61db8b79c52fe1362f1d8120e','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','189.203.97.141',20.637286,-103.392870,544467,'America/Mexico_City','2025-09-26 15:41:52'),
(4,'google','101830356115384258922','rquevedo@umich.mx','Roberto Carlos Quevedo Diaz','e113b8ab9e073d00687809adc2d415dd2942413973d6e5f15c5a3351132833f9','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15','200.68.166.79',19.692761,-101.159338,40,'America/Mexico_City','2025-09-27 16:23:29');
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;

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
  `owner_id` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL,
  `administrative_unit_id` int(11) DEFAULT NULL,
  `presidente` varchar(255) NOT NULL DEFAULT '',
  `email` varchar(255) NOT NULL DEFAULT '',
  `clave_afiliacion` varchar(255) NOT NULL DEFAULT '',
  `telefono` varchar(64) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `ix_committee_type` (`type`),
  KEY `ix_committee_section_number` (`section_number`),
  KEY `ix_committee_created_at` (`created_at`),
  KEY `committee_user_FK` (`owner_id`),
  CONSTRAINT `committee_user_FK` FOREIGN KEY (`owner_id`) REFERENCES `user` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `committee`
--

LOCK TABLES `committee` WRITE;
/*!40000 ALTER TABLE `committee` DISABLE KEYS */;
INSERT INTO `committee` VALUES
(3,'Lopez Mateos','1225','Transportistas','jodomaq@gmail.com','2025-09-17 02:23:58',NULL,'','jodomaq@gmail.com','',''),
(4,'Vota Segundo Piso','1221','Transportistas','sofiaequis43@gmail.com','2027-03-09 00:00:00',1,'','sofiaequis43@gmail.com','',''),
(9,'Justo Sierra','2154','Maestros','jodomaq@gmail.com','2025-09-28 22:19:05',NULL,'Jorge Perez Sanchez','ardutronic0034@gmail.com','215487','2154872154');
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `committeedocument`
--

LOCK TABLES `committeedocument` WRITE;
/*!40000 ALTER TABLE `committeedocument` DISABLE KEYS */;
INSERT INTO `committeedocument` VALUES
(1,'committees\\3\\93192239ef644a55a5e808c02e50a63c.png','urbana.png','image/png',195536,3,'2025-09-17 02:25:12'),
(3,'committees\\3\\d2a33f0768974323b6fe93b9e8f317aa.png','ninos.png','image/png',208809,3,'2025-09-17 02:42:25');
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
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
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
(29,'Arturo Iván López Medina','LOMA830617HDFPDR01','4433210987','arturo.lopez@outlook.com','1234','Marcela Torres',3,'2025-09-17 02:23:58'),
(30,'Gabriela Margarita Silva Rojas','SIRG890904MDFLJB02','4431098765','gabriela.silva@gmail.com','1235','Eduardo Morales',3,'2025-09-17 02:23:58'),
(31,'María Asucena López Campos','MAZS700902MMNORL02','3232323232','dj@gmail.com','2112','Juan Alvarez',4,'2027-03-09 00:00:00'),
(32,'Miguel Mojica Valencia','2154875421','2154872154','jo@gm.m','2154','xxx',9,'2025-09-28 22:56:16');
/*!40000 ALTER TABLE `committeemember` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `committeetype`
--

DROP TABLE IF EXISTS `committeetype`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `committeetype` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_committeetype_name` (`name`),
  KEY `ix_committeetype_created_at` (`created_at`),
  KEY `ix_committeetype_is_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `committeetype`
--

LOCK TABLES `committeetype` WRITE;
/*!40000 ALTER TABLE `committeetype` DISABLE KEYS */;
INSERT INTO `committeetype` VALUES
(1,'Maestros',1,'2025-09-19 03:21:56'),
(2,'Transportistas',1,'2025-09-19 03:21:56'),
(3,'Seccionales',1,'2025-09-19 03:21:56'),
(4,'Municipales',1,'2025-09-19 03:21:56'),
(5,'Deportistas',1,'2025-09-19 03:21:56'),
(6,'Colonias',1,'2027-04-09 00:00:00'),
(7,'Médicos',1,'2027-04-09 00:00:00'),
(8,'Comerciantes',1,'2027-04-09 00:00:00');
/*!40000 ALTER TABLE `committeetype` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seccion`
--

DROP TABLE IF EXISTS `seccion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `seccion` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `municipio` int(11) DEFAULT NULL,
  `nombre_municipio` varchar(50) DEFAULT NULL,
  `distrito` int(11) DEFAULT NULL,
  `nombre_distrito` varchar(50) DEFAULT NULL,
  `distrito_federal` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_seccion_distrito` (`distrito`),
  KEY `ix_seccion_distrito_federal` (`distrito_federal`),
  KEY `ix_seccion_municipio` (`municipio`),
  KEY `ix_seccion_id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seccion`
--

LOCK TABLES `seccion` WRITE;
/*!40000 ALTER TABLE `seccion` DISABLE KEYS */;
/*!40000 ALTER TABLE `seccion` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES
(1,'jodomaq@gmail.com','Donato Maldonado','https://lh3.googleusercontent.com/a/ACg8ocLnBi3-qXve3eqVap_6XccG0vbaK4B6qGQ0mJogxrf6BqFk6Uq1=s96-c','2025-09-16 23:31:59'),
(2,'sofiaequis43@gmail.com','Sofia Equis','https://lh3.googleusercontent.com/a/ACg8ocKQye9QTyLbB-0Fu0en1YCwxHmdJ078cJ5vN-goY5aIB61Qkw=s96-c','2025-09-28 01:36:31'),
(8,'ardutronic0034@gmail.com','Ardu Tronic','https://lh3.googleusercontent.com/a/ACg8ocI2Ney6nkePd6fAwcgrpKekvY_4UCxzMMKNBtK4KWLoWAPBu60=s96-c','2025-09-28 22:31:03');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `userassignment`
--

DROP TABLE IF EXISTS `userassignment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `userassignment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `administrative_unit_id` int(11) NOT NULL,
  `role` int(11) NOT NULL COMMENT '1=COORDINADOR_ESTATAL\r\n2=DELEGADO_REGIONAL \r\n3=COORDINADOR_DISTRITAL \r\n4=COORDINADOR_MUNICIPAL \r\n5=COORDINADOR SECCIONAL \r\n6=PRESIDENTE DE COMITE',
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_userassignment_user_id` (`user_id`),
  KEY `ix_userassignment_administrative_unit_id` (`administrative_unit_id`),
  KEY `ix_userassignment_role` (`role`),
  KEY `ix_userassignment_created_at` (`created_at`),
  CONSTRAINT `userassignment_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `userassignment_ibfk_2` FOREIGN KEY (`administrative_unit_id`) REFERENCES `administrativeunit` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userassignment`
--

LOCK TABLES `userassignment` WRITE;
/*!40000 ALTER TABLE `userassignment` DISABLE KEYS */;
INSERT INTO `userassignment` VALUES
(1,1,1,5,'2027-03-09 00:00:00'),
(2,2,1,6,'2027-03-09 00:00:00'),
(4,8,1,6,'2025-09-28 22:31:03');
/*!40000 ALTER TABLE `userassignment` ENABLE KEYS */;
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

-- Dump completed on 2025-09-29 12:04:38
