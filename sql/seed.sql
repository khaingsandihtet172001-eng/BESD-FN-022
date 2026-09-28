USE se_course_db;

INSERT IGNORE INTO `user`
  (userEmail, userPassword, userFirstName, userLastName, userTel, dateOfBirth)
VALUES
  ('daranporn@gmail.com', '$2b$10$H4SdNVlHN9.caiU4DZ.dCe9naFuqkCVXQAv6eN5f6PbH.My8SETvy', 'Sira', 'Weerakittana', '0891234567', '2012-05-26'),
  ('boonpoj@gmail.com', '$2b$10$A/Nk4Tc8hV.tAa.dhZxmx.Fhmzn5jc.zBVAwu4c8b1r1.aYwo460y', 'Rosanan', 'Suvanabhumiwong', '0641825563', '2011-10-17'),
  ('bodin_thai@gmail.com', '$2b$10$KKH0kDXCv4RVWtI.mzeCpehPIA4/YGIdacl0snXG6Ut5vfgSZ2Tn6', 'Tankwan', 'Srisuk', '0986345661', '2007-04-29');
