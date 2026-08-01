PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE viaggi (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  titolo      TEXT NOT NULL,
  stato       TEXT NOT NULL,
  data_inizio TEXT,
  data_fine   TEXT,
  descrizione TEXT,
  note        TEXT
, utente_id INTEGER);
INSERT INTO "viaggi" ("id","titolo","stato","data_inizio","data_fine","descrizione","note","utente_id") VALUES(1,'Cina & Hong Kong','futuro','2026-08-21','2026-09-08','18 giorni, tutto su rotaia. Nessun volo interno.',replace('**Voli**\n- Andata: 21 ago MXP → BRU (SN3154) → PEK (HU0492) · PNR ZI8TCU · arrivo 22 ago 05:00\n- Ritorno: 7 set HKG → HAN (VN0593 14:30) · scalo 9h15 · HAN → MXP (VN0073 00:50) · PNR XLGNLT\n\n**App essenziali da installare prima di partire**\nWeChat · Alipay · Didi · Trip.com · VPN\n\n**Treni**\nTutti prenotabili su Trip.com con passaporto','\n',char(10)),1);
INSERT INTO "viaggi" ("id","titolo","stato","data_inizio","data_fine","descrizione","note","utente_id") VALUES(2,'Thailandia','passato','2018-09-17','2018-09-29','12 giorni a Bangkok.','',1);
INSERT INTO "viaggi" ("id","titolo","stato","data_inizio","data_fine","descrizione","note","utente_id") VALUES(6,'Lesweek 2026','bozza','2026-07-22','2026-07-27',NULL,NULL,1);
INSERT INTO "viaggi" ("id","titolo","stato","data_inizio","data_fine","descrizione","note","utente_id") VALUES(7,'Pride 2026','bozza','2026-06-18','2026-06-27','I pride fatti nel 2026',NULL,1);
CREATE TABLE tappe (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  viaggio_id          INTEGER NOT NULL,
  nome                TEXT NOT NULL,
  paese               TEXT,
  paese_iso           TEXT,
  lat                 REAL,
  lng                 REAL,
  ordine              INTEGER,
  notti               INTEGER,
  data_arrivo         TEXT,
  data_partenza       TEXT,
  hotel               TEXT,
  stazione            TEXT,
  note                TEXT,
  trasporto_arrivo    TEXT,
  trasporto_partenza  TEXT,
  FOREIGN KEY (viaggio_id) REFERENCES viaggi(id)
);
INSERT INTO "tappe" ("id","viaggio_id","nome","paese","paese_iso","lat","lng","ordine","notti","data_arrivo","data_partenza","hotel","stazione","note","trasporto_arrivo","trasporto_partenza") VALUES(101,1,'Pechino','Cina','CN',39.9163,116.3972,1,3,'2026-08-22','2026-08-25','{"nome":"Jingman Siheyuan Hotel","indirizzo":"Beijing Jishuitan Hospital Houhai Branch","link":"https://maps.google.com/?q=Jingman+Siheyuan+Hotel+Beijing+Houhai","prenotazione":"1381034208447234","costo":"126.81 EUR"}','{"nome":"Pechino Nord","note":"Partenza 25 ago ore 07:30"}','Arrivo volo HU0492 ore 05:00 T2. Jet lag 6h — previsto riposo mattina.','{"mezzo": "aereo", "mezzo_altro": "", "dettagli": "Volo HU0492 BRU → PEK · arrivo 22 ago 05:00", "lat": null, "lng": null, "link": ""}','{"mezzo": "treno", "mezzo_altro": "", "dettagli": "AV Pechino Nord → Datong Sud · 07:30 · 25 agosto", "lat": null, "lng": null, "link": ""}');
INSERT INTO "tappe" ("id","viaggio_id","nome","paese","paese_iso","lat","lng","ordine","notti","data_arrivo","data_partenza","hotel","stazione","note","trasporto_arrivo","trasporto_partenza") VALUES(102,1,'Datong','Cina','CN',40.0767,113.2945,2,1,'2026-08-25','2026-08-26','{"nome":"Yungang Jianguo Hotel","indirizzo":"Datong, Cina","link":"https://maps.google.com/?q=Yungang+Jianguo+Hotel+Datong","prenotazione":"1381034496021784","costo":"43.75 EUR"}','{"nome":"Datong Sud","note":"Arrivo 25 ago · partenza 26 ago 06:58"}','Giornata con taxi privato ~350 yuan.','{"mezzo": "treno", "mezzo_altro": "", "dettagli": "AV Pechino Nord → Datong Sud · 07:30 · 25 agosto", "lat": null, "lng": null, "link": ""}','{"mezzo": "treno", "mezzo_altro": "", "dettagli": "AV Datong Sud → Xi''an · 06:58 · 26 agosto", "lat": null, "lng": null, "link": ""}');
INSERT INTO "tappe" ("id","viaggio_id","nome","paese","paese_iso","lat","lng","ordine","notti","data_arrivo","data_partenza","hotel","stazione","note","trasporto_arrivo","trasporto_partenza") VALUES(103,1,'Xi''an','Cina','CN',34.2604,108.9486,3,2,'2026-08-26','2026-08-28','{"nome":"KAJU Hotel","indirizzo":"","link":""}','{"nome":"Xi''an North Station","note":"Partenza 28 ago sera"}','','{"mezzo": "treno", "mezzo_altro": "", "dettagli": "AV Datong Sud → Xi''an · 06:58 · 26 agosto", "lat": null, "lng": null, "link": ""}','{"mezzo": "treno", "mezzo_altro": "", "dettagli": "AV Xi''an → Changsha · sera 28 agosto · ~5h", "lat": null, "lng": null, "link": ""}');
INSERT INTO "tappe" ("id","viaggio_id","nome","paese","paese_iso","lat","lng","ordine","notti","data_arrivo","data_partenza","hotel","stazione","note","trasporto_arrivo","trasporto_partenza") VALUES(104,1,'Changsha','Cina','CN',28.1987,112.9724,4,1,'2026-08-28','2026-08-29','{"nome":"KAJU Hotel","indirizzo":"Xi''an Bell and Drum Tower, Huimin Street","link":"https://maps.google.com/?q=KAJU+Hotel+Xian+Bell+Drum+Tower","prenotazione":"1381034496045509","costo":"28.82 EUR"}','{"nome":"Changsha South Station","note":"Arrivo sera 28 · partenza mattina 29"}','','{"mezzo": "treno", "mezzo_altro": "", "dettagli": "AV Xi''an → Changsha · ~5h · sera 28 agosto", "lat": null, "lng": null, "link": ""}','{"mezzo": "treno", "mezzo_altro": "", "dettagli": "AV Changsha South → Zhangjiajie West · ~2h · mattina 29 agosto", "lat": null, "lng": null, "link": ""}');
INSERT INTO "tappe" ("id","viaggio_id","nome","paese","paese_iso","lat","lng","ordine","notti","data_arrivo","data_partenza","hotel","stazione","note","trasporto_arrivo","trasporto_partenza") VALUES(105,1,'Zhangjiajie','Cina','CN',29.1256,110.4785,5,2,'2026-08-29','2026-08-31','{"nome":"Thousand Hotel","indirizzo":"","link":""}','{"nome":"Zhangjiajie West","note":""}','','{"mezzo": "treno", "mezzo_altro": "", "dettagli": "AV Changsha → Zhangjiajie West · ~2h · 29 agosto", "lat": null, "lng": null, "link": ""}','{"mezzo": "treno", "mezzo_altro": "", "dettagli": "AV Zhangjiajie → Fenghuanggucheng · poi taxi 10 km · 31 agosto", "lat": null, "lng": null, "link": ""}');
INSERT INTO "tappe" ("id","viaggio_id","nome","paese","paese_iso","lat","lng","ordine","notti","data_arrivo","data_partenza","hotel","stazione","note","trasporto_arrivo","trasporto_partenza") VALUES(106,1,'Fenghuang','Cina','CN',27.9505,109.5989,6,1,'2026-08-31','2026-09-01','{"nome":"Anzhidinglan B&B","indirizzo":"Sul fiume Tuojiang","note":"Pickup dalla stazione incluso."}','{"nome":"Fenghuanggucheng","note":"~10 km dalla città antica"}','','{"mezzo": "treno", "mezzo_altro": "", "dettagli": "AV Zhangjiajie → Fenghuanggucheng ~1h · 31 agosto", "lat": null, "lng": null, "link": ""}','{"mezzo": "treno", "mezzo_altro": "", "dettagli": "Treno Fenghuanggucheng → Guilin · ~3-4h · 1 settembre", "lat": null, "lng": null, "link": ""}');
INSERT INTO "tappe" ("id","viaggio_id","nome","paese","paese_iso","lat","lng","ordine","notti","data_arrivo","data_partenza","hotel","stazione","note","trasporto_arrivo","trasporto_partenza") VALUES(107,1,'Guilin','Cina','CN',25.2786,110.295,7,2,'2026-09-01','2026-09-03','{"nome":"Shitsan Bliss Qintai Ethnic Boutique Hotel","indirizzo":"Changsha, Cina","link":"https://maps.google.com/?q=Shitsan+Bliss+Qintai+Ethnic+Boutique+Hotel+Changsha","prenotazione":"1381034496080884","costo":"57.26 EUR"}','{"nome":"Guilin","note":""}','','{"mezzo": "treno", "mezzo_altro": "", "dettagli": "Treno Fenghuanggucheng → Guilin · ~3-4h · 1 settembre", "lat": null, "lng": null, "link": ""}','{"mezzo": "nave", "mezzo_altro": "", "dettagli": "Crociera Li River → Yangshuo · 3 settembre · poi → Hong Kong · 4 settembre", "lat": null, "lng": null, "link": ""}');
INSERT INTO "tappe" ("id","viaggio_id","nome","paese","paese_iso","lat","lng","ordine","notti","data_arrivo","data_partenza","hotel","stazione","note","trasporto_arrivo","trasporto_partenza") VALUES(108,1,'Yangshuo','Cina','CN',24.777,110.4953,8,1,'2026-09-03','2026-09-04','{"nome":"THOUSAND HOTEL","indirizzo":"Zhangjiajie, Cina","link":"https://maps.google.com/?q=THOUSAND+HOTEL+Zhangjiajie","prenotazione":"1381034605073838","costo":"71.58 EUR"}','{"nome":"","note":""}','','{"mezzo": "nave", "mezzo_altro": "", "dettagli": "Crociera Li River → Yangshuo · 3 settembre", "lat": null, "lng": null, "link": ""}','{"mezzo": "altro", "mezzo_altro": "auto + treno AV + metro", "dettagli": "Yangshuo → Guilin → Guangzhou AV (~2h30) → MTR Hong Kong (~50 min) · 4 settembre", "lat": null, "lng": null, "link": ""}');
INSERT INTO "tappe" ("id","viaggio_id","nome","paese","paese_iso","lat","lng","ordine","notti","data_arrivo","data_partenza","hotel","stazione","note","trasporto_arrivo","trasporto_partenza") VALUES(109,1,'Hong Kong','Hong Kong','HK',22.2978,114.1722,9,3,'2026-09-04','2026-09-07','{"nome":"","indirizzo":"Tsim Sha Tsui, Kowloon","link":""}','{"nome":"West Kowloon","note":"Arrivo MTR da Guangzhou"}','Nessun visto per italiani · 90 giorni','{"mezzo": "treno", "mezzo_altro": "", "dettagli": "MTR Cross-Boundary Guangzhou → West Kowloon · ~50 min · 4 settembre", "lat": null, "lng": null, "link": ""}','{"mezzo": "aereo", "mezzo_altro": "", "dettagli": "Volo VN0593 HKG → HAN 14:30 · scalo 9h15 · VN0073 00:50 → MXP · PNR XLGNLT", "lat": null, "lng": null, "link": ""}');
INSERT INTO "tappe" ("id","viaggio_id","nome","paese","paese_iso","lat","lng","ordine","notti","data_arrivo","data_partenza","hotel","stazione","note","trasporto_arrivo","trasporto_partenza") VALUES(201,2,'Bangkok','Thailandia','TH',13.7563,100.5018,1,12,'2018-09-17','2018-09-29','{"nome":"Anzhidinglan B&B","indirizzo":"Fenghuang Ancient Town, sul fiume Tuojiang","link":"https://maps.google.com/?q=Anzhidinglan+BB+Fenghuang+Ancient+Town","prenotazione":"1381034605100809","costo":"31.00 EUR"}','{}','',NULL,NULL);
INSERT INTO "tappe" ("id","viaggio_id","nome","paese","paese_iso","lat","lng","ordine","notti","data_arrivo","data_partenza","hotel","stazione","note","trasporto_arrivo","trasporto_partenza") VALUES(207,6,'Torre del Lago Puccini',NULL,'IT',43.8280555,10.2912202,1,5,'2026-07-22','2026-07-27','{"link":"Via C. Colombo, 7, 55049 Torre del Lago Puccini LU","nome":"casa privata","note":"tanta roba"}','{}',NULL,'{"mezzo":"auto","lat":45.4476852,"lng":8.6104997,"link":"","dettagli":"Partenza alle ore 4.30"}','{"mezzo":"auto"}');
INSERT INTO "tappe" ("id","viaggio_id","nome","paese","paese_iso","lat","lng","ordine","notti","data_arrivo","data_partenza","hotel","stazione","note","trasporto_arrivo","trasporto_partenza") VALUES(208,7,'Roma',NULL,'IT',41.8520413,12.6312117,2,2,'2026-06-19','2026-06-21','{"nome":"Appartamenti Romolo e Remo","lat":41.8718042,"lng":12.4834919,"indirizzo":"Via Pellegrino Matteucci, Municipio Roma VIII, Roma, Lazio, 00154, Italia","link":"","link_prenotazione":"","costo":"","prenotazione":"","note":""}',NULL,NULL,NULL,NULL);
INSERT INTO "tappe" ("id","viaggio_id","nome","paese","paese_iso","lat","lng","ordine","notti","data_arrivo","data_partenza","hotel","stazione","note","trasporto_arrivo","trasporto_partenza") VALUES(209,7,'Milano',NULL,'IT',45.4542119,9.111351,3,NULL,'2026-06-27','2026-06-27','{"nome":"","lat":"","lng":"","indirizzo":"","link":"","link_prenotazione":"","costo":"","prenotazione":"","note":""}',NULL,NULL,NULL,NULL);
INSERT INTO "tappe" ("id","viaggio_id","nome","paese","paese_iso","lat","lng","ordine","notti","data_arrivo","data_partenza","hotel","stazione","note","trasporto_arrivo","trasporto_partenza") VALUES(210,7,'Firenze',NULL,'IT',43.7697955,11.2556404,1,1,'2026-06-18','2026-06-19','{"nome":"The Gate Hotel","lat":43.8312561,"lng":11.1602081,"indirizzo":"The Gate Hotel, Via di Limite, Prataccio, Capalle, Sesto Fiorentino, Firenze, Toscana, 50019, Italia","link":"","link_prenotazione":"","costo":"","prenotazione":"","note":"pernotto tecnico, ben 3 ore di sonno e poi siamo ripartite\n"}',NULL,NULL,NULL,NULL);
CREATE TABLE giorni (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  tappa_id INTEGER NOT NULL,
  numero   INTEGER,
  titolo   TEXT,
  data     TEXT,
  FOREIGN KEY (tappa_id) REFERENCES tappe(id)
);
INSERT INTO "giorni" ("id","tappa_id","numero","titolo","data") VALUES(1,101,1,'Arrivo e orientamento','2026-08-22');
INSERT INTO "giorni" ("id","tappa_id","numero","titolo","data") VALUES(2,101,2,'Asse imperiale','2026-08-23');
INSERT INTO "giorni" ("id","tappa_id","numero","titolo","data") VALUES(3,101,3,'Grande Muraglia','2026-08-24');
INSERT INTO "giorni" ("id","tappa_id","numero","titolo","data") VALUES(4,102,1,'Giornata con taxi privato','2026-08-25');
INSERT INTO "giorni" ("id","tappa_id","numero","titolo","data") VALUES(5,103,1,'Arrivo e città antica','2026-08-26');
INSERT INTO "giorni" ("id","tappa_id","numero","titolo","data") VALUES(6,103,2,'Terracotta e mura','2026-08-27');
INSERT INTO "giorni" ("id","tappa_id","numero","titolo","data") VALUES(7,103,3,'Giornata libera e partenza','2026-08-28');
INSERT INTO "giorni" ("id","tappa_id","numero","titolo","data") VALUES(8,104,1,'Tappa di transito','2026-08-28');
INSERT INTO "giorni" ("id","tappa_id","numero","titolo","data") VALUES(9,105,1,'Tianmen Mountain','2026-08-29');
INSERT INTO "giorni" ("id","tappa_id","numero","titolo","data") VALUES(10,105,2,'Avatar Mountains · Wulingyuan','2026-08-30');
INSERT INTO "giorni" ("id","tappa_id","numero","titolo","data") VALUES(11,105,3,'Partenza per Fenghuang','2026-08-31');
INSERT INTO "giorni" ("id","tappa_id","numero","titolo","data") VALUES(12,106,1,'Città della fenice','2026-08-31');
INSERT INTO "giorni" ("id","tappa_id","numero","titolo","data") VALUES(13,106,2,'Alba e partenza','2026-09-01');
INSERT INTO "giorni" ("id","tappa_id","numero","titolo","data") VALUES(14,107,1,'Arrivo e serata sul lago','2026-09-01');
INSERT INTO "giorni" ("id","tappa_id","numero","titolo","data") VALUES(15,107,2,'Gita a Longji + Reed Flute Cave','2026-09-02');
INSERT INTO "giorni" ("id","tappa_id","numero","titolo","data") VALUES(16,107,3,'Crociera Li River → Yangshuo','2026-09-03');
INSERT INTO "giorni" ("id","tappa_id","numero","titolo","data") VALUES(17,108,1,'Arrivo dalla crociera','2026-09-03');
INSERT INTO "giorni" ("id","tappa_id","numero","titolo","data") VALUES(18,108,2,'Mattina e partenza per Hong Kong','2026-09-04');
INSERT INTO "giorni" ("id","tappa_id","numero","titolo","data") VALUES(19,109,1,'Arrivo e Kowloon','2026-09-04');
INSERT INTO "giorni" ("id","tappa_id","numero","titolo","data") VALUES(20,109,2,'Victoria Peak e isola','2026-09-05');
INSERT INTO "giorni" ("id","tappa_id","numero","titolo","data") VALUES(21,109,3,'Lantau Island','2026-09-06');
INSERT INTO "giorni" ("id","tappa_id","numero","titolo","data") VALUES(22,109,4,'Mattina libera e partenza','2026-09-07');
INSERT INTO "giorni" ("id","tappa_id","numero","titolo","data") VALUES(23,210,1,'Arriviamo sane e salve',NULL);
INSERT INTO "giorni" ("id","tappa_id","numero","titolo","data") VALUES(24,207,1,NULL,NULL);
CREATE TABLE attivita (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  giorno_id INTEGER NOT NULL,
  ora      TEXT,
  nome     TEXT,
  note     TEXT,
  tipo     TEXT,
  lat      REAL,
  lng      REAL, link TEXT,
  FOREIGN KEY (giorno_id) REFERENCES giorni(id)
);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(1,1,'05:00','Arrivo Pechino T2','Bagagli, yuan, SIM cinese.','',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(2,1,'09:00','Riposo','3-4h — jet lag di 6 ore.','',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(3,1,'14:00','Tempio dei Lama Yonghe','Il tempio lamaista più importante di Pechino.','attrazione',39.9469,116.4103,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(4,1,'16:00','Torri del Tamburo e della Campana','','attrazione',39.9387,116.3953,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(5,1,'18:00','Hutong Nanluoguxiang','','attrazione',39.9369,116.4011,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(6,1,'19:30','Cena a Lago Houhai','','cibo',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(7,2,'07:30','Piazza Tiananmen','','attrazione',39.9055,116.3976,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(8,2,'09:00','Città Proibita','3-4h.','attrazione',39.9163,116.3972,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(9,2,'13:00','Parco Jingshan','Vista sulla Città Proibita.','attrazione',39.9219,116.3887,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(10,2,'15:30','Tempio del Cielo','~2h.','attrazione',39.8822,116.4066,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(11,2,'18:30','Sera a Lago Houhai','','cibo',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(12,3,'07:00','Partenza per Mutianyu','~1h30.','logistica',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(13,3,'08:30','Grande Muraglia di Mutianyu','Funivia inclusa.','attrazione',40.4319,116.5636,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(14,3,'11:00','Toboggan sulla Muraglia','~15 min.','attrazione',40.4319,116.5636,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(15,3,'13:30','Rientro a Pechino','','logistica',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(16,3,'15:30','Pomeriggio libero','','',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(17,3,'20:00','Preparativi','Treno domani 07:30 da Pechino Nord.','logistica',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(18,4,'09:15','Arrivo Datong Sud','~350 yuan taxi privato.','logistica',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(19,4,'10:00','Tempio Sospeso Xuankong Si','~1h30 trasferimento. Visita ~1h30.','attrazione',39.6608,113.7272,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(20,4,'14:30','Grotte di Yungang UNESCO','~2h trasferimento. Visita 2h30-3h.','attrazione',40.1102,113.1285,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(21,4,'17:30','Rientro a Datong','','logistica',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(22,4,'19:30','Cena: dao xiao mian','','cibo',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(23,5,'11:30','Arrivo da Datong','AV ~4h30.','logistica',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(24,5,'13:30','Quartiere Musulmano','Street food: roujiamo, biang biang noodles.','cibo',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(25,5,'16:00','Torre della Campana e Torre del Tamburo','','attrazione',34.2665,108.9479,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(26,5,'19:30','Cena','','cibo',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(27,6,'07:30','Partenza per Terracotta','Bus turistico n.5.','logistica',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(28,6,'09:00','Esercito di Terracotta','3 fosse. ~3h.','attrazione',34.3841,109.2785,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(29,6,'15:00','Mura della città in bici','~1h30 giro completo.','attrazione',34.2658,108.9542,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(30,6,'19:00','Cena e riposo','','cibo',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(31,7,'09:00','Grande Moschea di Xi''an','Una delle più antiche d''Asia. ~1h.','attrazione',34.2659,108.9426,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(32,7,'11:00','Museo di Storia dello Shaanxi','Collezione Tang straordinaria. ~2h. Gratuito.','attrazione',34.2197,108.9643,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(33,7,'14:00','Pomeriggio libero','Shopping Huimin Street.','',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(34,7,'17:00','Partenza per Changsha','AV ~5h.','logistica',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(35,8,'22:00','Arrivo da Xi''an','Check-in hotel vicino alla stazione.','logistica',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(36,8,'22:30','Taiping Road Street Food','Cucina Hunan piccantissima. Tang hulu, smelly tofu fritto.','cibo',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(37,8,'08:00','Museo Provinciale Hunan (facoltativo)','La mummia di Lady Dai (200 a.C.). ~1h30.','attrazione',28.1942,112.9836,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(38,8,'10:00','Monte Yuelu','Accademia millenaria. ~1h.','attrazione',28.1877,112.9304,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(39,8,'12:00','Pranzo + partenza','AV Changsha South → Zhangjiajie West. ~2h.','logistica',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(40,9,'Pomeriggio','Arrivo da Changsha','AV ~2h. Check-in Thousand Hotel.','logistica',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(41,9,'15:00','Funivia Tianmen Mountain','7.455m, 30 min. ~258 yuan.','attrazione',29.0469,110.4725,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(42,9,'16:30','Porta del Paradiso + passerelle vetro','','attrazione',29.0758,110.4808,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(43,9,'18:00','Discesa · cena','','cibo',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(44,10,'06:30','Ingresso parco Wulingyuan','','logistica',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(45,10,'07:00','Ascensore Bailong','335m in 88 sec.','attrazione',29.3177,110.4358,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(46,10,'08:00','Yuanjiajie · Avatar Mountain','Southern Sky Column.','attrazione',29.3522,110.4364,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(47,10,'11:00','Monte Tianzi','Bus navetta gratuito.','attrazione',29.3817,110.4217,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(48,10,'14:30','Golden Whip Stream','7.5 km. Scimmie selvatiche.','attrazione',29.3213,110.4536,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(49,10,'17:00','Uscita · cena','','cibo',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(50,11,'Mattina','Treno per Fenghuanggucheng','AV ~1h. Poi taxi 10 km / ~25 yuan.','logistica',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(51,12,'12:00','Arrivo da Zhangjiajie','AV ~1h, poi taxi ~25 yuan.','logistica',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(52,12,'13:00','Check-in Anzhidinglan B&B','Sul fiume Tuojiang. Pickup incluso.','logistica',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(53,12,'14:00','Ponte Arcobaleno + Diaojiaolou','','attrazione',27.9172,109.6736,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(54,12,'16:30','Barca sul Tuojiang','~30-40 yuan.','attrazione',27.9153,109.6742,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(55,12,'18:30','Cena con sapori Miao','Anatra al sangue, pesce piccante.','cibo',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(56,12,'19:30','Crociera serale illuminata','','attrazione',27.9153,109.6742,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(57,12,'20:30','Falò Miao (facoltativo)','50–80 yuan.','attrazione',27.9172,109.6736,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(58,13,'07:00','Passeggiata all''alba','Silenziosa e autentica.','attrazione',24.7781,110.4942,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(59,13,'10:00','Taxi per la stazione','Navetta Anzhidinglan inclusa.','logistica',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(60,14,'15:00','Arrivo da Fenghuang','','logistica',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(61,14,'17:30','Pagode del Sole e della Luna','Al tramonto sul Lago Shanhu.','attrazione',25.2744,110.2936,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(62,14,'19:00','Zhengyang Road','Ponti illuminati, cibo di strada.','cibo',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(63,15,'07:30','Partenza auto privata per Longji','~1h30. Biglietto 80 yuan.','logistica',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(64,15,'09:00','Jinkeng/Dazhai · Punti panoramici','Terrazze verde brillante. ~3h di cammino.','attrazione',25.7794,110.0697,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(65,15,'13:00','Pranzo al villaggio','Riso glutinoso in canna di bambù, vino di riso Yao.','cibo',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(66,15,'14:30','Rientro a Guilin','~1h30. Arrivo ~16:00.','logistica',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(67,15,'16:30','Reed Flute Cave','Grotta 180m con stalattiti illuminate. ~1h.','attrazione',25.2403,110.2497,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(68,15,'19:00','Cena · preparativi crociera','','cibo',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(69,16,'08:00','Transfer al molo Zhujiang','~30 min da Guilin centro.','logistica',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(70,16,'09:30','Crociera Li River','4h30. Karst, villaggi, bufali, pescatori con cormorani.','attrazione',25.0638,110.2972,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(71,16,'14:00','Arrivo a Yangshuo','Molo Longtoushan. Taxi per hotel.','logistica',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(72,17,'14:00','Sbarco a Yangshuo','Molo Longtoushan. Taxi per hotel.','logistica',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(73,17,'15:30','West Street','Architettura Ming-Qing, caffè, artigianato.','attrazione',24.7781,110.4942,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(74,17,'17:00','Bici tra le colline carsiche','','attrazione',24.7781,110.4942,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(75,17,'20:00','Impression Sanjie Liu','~200 yuan.','attrazione',24.8897,110.4342,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(76,18,'07:30','Fiume Yulong in zattera','~80 yuan, 1h.','attrazione',24.7519,110.4786,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(77,18,'09:30','Check-out e partenza','','logistica',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(78,18,'10:30','Bus Yangshuo → Guilin','~1h. Poi AV Guangzhou (~2h30).','logistica',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(79,18,'15:00','MTR → Hong Kong','~50 min. Arrivo West Kowloon.','logistica',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(80,19,'16:00','Arrivo West Kowloon','Da Guangzhou via MTR.','logistica',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(81,19,'17:30','Check-in hotel Kowloon','Tsim Sha Tsui.','logistica',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(82,19,'19:00','Temple Street Night Market','Cibo di strada, cartomanti, souvenir.','cibo',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(83,19,'21:00','Skyline Avenue of Stars','Il panorama notturno più bello di HK.','attrazione',22.2949,114.1722,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(84,20,'08:00','Dim sum del mattino','Ristoranti locali a Sham Shui Po.','cibo',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(85,20,'09:30','Star Ferry → HK Island','3.5 HKD, 10 min.','attrazione',22.2937,114.1687,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(86,20,'10:00','Peak Tram → Victoria Peak','','attrazione',22.2759,114.1455,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(87,20,'11:30','Central e SoHo','Hollywood Road. Escalator coperta.','attrazione',22.2822,114.1545,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(88,20,'15:00','Mong Kok','Ladies Market e Flower Market.','attrazione',22.3193,114.1694,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(89,20,'19:00','Cena cantonese','Rooftop bar con skyline.','cibo',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(90,21,'09:00','MTR → Tung Chung · Cable car Ngong Ping','25 min di funivia panoramica.','logistica',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(91,21,'10:30','Tian Tan Big Buddha','34m. 268 scalini. Vista sull''oceano.','attrazione',22.2538,113.9053,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(92,21,'12:30','Pranzo vegetariano monastero Po Lin','','cibo',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(93,21,'14:30','Villaggio Tai O','Il ''Venezia di Hong Kong''. Delfini rosa.','attrazione',22.2527,113.8618,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(94,21,'17:30','Rientro a Kowloon','Ultima sera a Hong Kong.','logistica',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(95,22,'08:00','Ultima colazione','Dim sum o cha chaan teng locale.','cibo',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(96,22,'10:00','Passeggiata o shopping finale','','',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(97,22,'12:30','Airport Express da Hong Kong Station','~24 min.','logistica',NULL,NULL,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(99,24,'23:01','Mamamia',NULL,'attrazione',43.826438,10.2572644,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(100,24,'19:00','Baddy',NULL,'ristorante',43.8231473,10.2583508,NULL);
INSERT INTO "attivita" ("id","giorno_id","ora","nome","note","tipo","lat","lng","link") VALUES(101,24,'08:23','Panificio Be'' mi forno',NULL,'ristorante',43.8249069,10.2798836,NULL);
CREATE TABLE checklist_voci (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  viaggio_id INTEGER NOT NULL,
  testo      TEXT NOT NULL,
  completata INTEGER DEFAULT 0,
  ordine     INTEGER DEFAULT 0, attivita_id INTEGER,
  FOREIGN KEY (viaggio_id) REFERENCES viaggi(id)
);
INSERT INTO "checklist_voci" ("id","viaggio_id","testo","completata","ordine","attivita_id") VALUES(1,1,'Visto Cina (tipo L, ~60-80€)',0,0,NULL);
INSERT INTO "checklist_voci" ("id","viaggio_id","testo","completata","ordine","attivita_id") VALUES(2,1,'VPN installata e testata',0,1,NULL);
INSERT INTO "checklist_voci" ("id","viaggio_id","testo","completata","ordine","attivita_id") VALUES(3,1,'WeChat attivato',0,2,NULL);
INSERT INTO "checklist_voci" ("id","viaggio_id","testo","completata","ordine","attivita_id") VALUES(4,1,'Alipay attivato',0,3,NULL);
INSERT INTO "checklist_voci" ("id","viaggio_id","testo","completata","ordine","attivita_id") VALUES(5,1,'Assicurazione viaggio',0,4,NULL);
INSERT INTO "checklist_voci" ("id","viaggio_id","testo","completata","ordine","attivita_id") VALUES(6,1,'Città Proibita — biglietti WeChat',0,5,NULL);
INSERT INTO "checklist_voci" ("id","viaggio_id","testo","completata","ordine","attivita_id") VALUES(7,1,'Grande Muraglia Mutianyu — mutianyugreatwall.com',0,6,NULL);
INSERT INTO "checklist_voci" ("id","viaggio_id","testo","completata","ordine","attivita_id") VALUES(8,1,'Esercito di Terracotta — bmy.com.cn',0,7,NULL);
INSERT INTO "checklist_voci" ("id","viaggio_id","testo","completata","ordine","attivita_id") VALUES(9,1,'Grotte di Yungang — WeChat',0,8,NULL);
INSERT INTO "checklist_voci" ("id","viaggio_id","testo","completata","ordine","attivita_id") VALUES(10,1,'Crociera Li River — WeChat Lijiang Ticketing Office',0,9,NULL);
INSERT INTO "checklist_voci" ("id","viaggio_id","testo","completata","ordine","attivita_id") VALUES(11,1,'Cable car Ngong Ping Lantau — prenotare online',0,10,NULL);
INSERT INTO "checklist_voci" ("id","viaggio_id","testo","completata","ordine","attivita_id") VALUES(12,1,'Yuan cinesi e dollari HK',0,11,NULL);
CREATE TABLE utenti (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  google_id  TEXT NOT NULL UNIQUE,
  email      TEXT NOT NULL UNIQUE,
  nome       TEXT,
  avatar_url TEXT,
  creato_il  TEXT DEFAULT (datetime('now'))
);
INSERT INTO "utenti" ("id","google_id","email","nome","avatar_url","creato_il") VALUES(1,'105373342811964481695','elena.gallarate@gmail.com','Elena Gallarate','https://lh3.googleusercontent.com/a/ACg8ocLInmTDjCHKR_0btDhgoVqWGKpj3K5y7PBPsQ9b19U7dn-Qdms=s96-c','2026-07-18 12:19:34');
CREATE TABLE IF NOT EXISTS "wandex_voci" (
  utente_id INTEGER NOT NULL,
  categoria TEXT NOT NULL,
  chiave    TEXT NOT NULL,
  PRIMARY KEY (utente_id, categoria, chiave)
);
INSERT INTO "wandex_voci" ("utente_id","categoria","chiave") VALUES(1,'province','RM');
INSERT INTO "wandex_voci" ("utente_id","categoria","chiave") VALUES(1,'province','NA');
INSERT INTO "wandex_voci" ("utente_id","categoria","chiave") VALUES(1,'province','MO');
INSERT INTO "wandex_voci" ("utente_id","categoria","chiave") VALUES(1,'province','PR');
INSERT INTO "wandex_voci" ("utente_id","categoria","chiave") VALUES(1,'province','UD');
INSERT INTO "wandex_voci" ("utente_id","categoria","chiave") VALUES(1,'province','GE');
INSERT INTO "wandex_voci" ("utente_id","categoria","chiave") VALUES(1,'province','BG');
INSERT INTO "wandex_voci" ("utente_id","categoria","chiave") VALUES(1,'province','MI');
INSERT INTO "wandex_voci" ("utente_id","categoria","chiave") VALUES(1,'province','VA');
INSERT INTO "wandex_voci" ("utente_id","categoria","chiave") VALUES(1,'province','AN');
INSERT INTO "wandex_voci" ("utente_id","categoria","chiave") VALUES(1,'province','PU');
INSERT INTO "wandex_voci" ("utente_id","categoria","chiave") VALUES(1,'province','AL');
INSERT INTO "wandex_voci" ("utente_id","categoria","chiave") VALUES(1,'province','AT');
INSERT INTO "wandex_voci" ("utente_id","categoria","chiave") VALUES(1,'province','BI');
INSERT INTO "wandex_voci" ("utente_id","categoria","chiave") VALUES(1,'province','CN');
INSERT INTO "wandex_voci" ("utente_id","categoria","chiave") VALUES(1,'province','NO');
INSERT INTO "wandex_voci" ("utente_id","categoria","chiave") VALUES(1,'province','TO');
INSERT INTO "wandex_voci" ("utente_id","categoria","chiave") VALUES(1,'province','VB');
INSERT INTO "wandex_voci" ("utente_id","categoria","chiave") VALUES(1,'province','VC');
INSERT INTO "wandex_voci" ("utente_id","categoria","chiave") VALUES(1,'province','LE');
INSERT INTO "wandex_voci" ("utente_id","categoria","chiave") VALUES(1,'province','PA');
INSERT INTO "wandex_voci" ("utente_id","categoria","chiave") VALUES(1,'province','FI');
INSERT INTO "wandex_voci" ("utente_id","categoria","chiave") VALUES(1,'province','LU');
INSERT INTO "wandex_voci" ("utente_id","categoria","chiave") VALUES(1,'province','SI');
INSERT INTO "wandex_voci" ("utente_id","categoria","chiave") VALUES(1,'province','VR');
INSERT INTO "wandex_voci" ("utente_id","categoria","chiave") VALUES(1,'province','VE');
INSERT INTO "wandex_voci" ("utente_id","categoria","chiave") VALUES(1,'capitali_eu','Vienna');
INSERT INTO "wandex_voci" ("utente_id","categoria","chiave") VALUES(1,'province','RC');
INSERT INTO "wandex_voci" ("utente_id","categoria","chiave") VALUES(1,'province','FE');
INSERT INTO "wandex_voci" ("utente_id","categoria","chiave") VALUES(1,'province','KR');
INSERT INTO "wandex_voci" ("utente_id","categoria","chiave") VALUES(1,'province','CH');
CREATE TABLE wandex_catalogo (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  categoria TEXT NOT NULL,
  chiave    TEXT NOT NULL,
  nome      TEXT NOT NULL,
  gruppo    TEXT,
  paese     TEXT,
  iso       TEXT,
  lat       REAL,
  lng       REAL,
  UNIQUE(categoria, chiave)
);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(1,'province','AQ','L''Aquila','Abruzzo',NULL,'IT',42.3498,13.3995);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(2,'province','CH','Chieti','Abruzzo',NULL,'IT',42.3505,14.1679);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(3,'province','PE','Pescara','Abruzzo',NULL,'IT',42.4617,14.2153);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(4,'province','TE','Teramo','Abruzzo',NULL,'IT',42.6589,13.704);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(5,'province','MT','Matera','Basilicata',NULL,'IT',40.6664,16.6043);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(6,'province','PZ','Potenza','Basilicata',NULL,'IT',40.6404,15.8056);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(7,'province','CZ','Catanzaro','Calabria',NULL,'IT',38.9097,16.5878);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(8,'province','CS','Cosenza','Calabria',NULL,'IT',39.3007,16.2536);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(9,'province','KR','Crotone','Calabria',NULL,'IT',39.0852,17.1286);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(10,'province','RC','Reggio Calabria','Calabria',NULL,'IT',38.1143,15.6487);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(11,'province','VV','Vibo Valentia','Calabria',NULL,'IT',38.6762,16.0997);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(12,'province','AV','Avellino','Campania',NULL,'IT',40.9143,14.7908);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(13,'province','BN','Benevento','Campania',NULL,'IT',41.1297,14.7827);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(14,'province','CE','Caserta','Campania',NULL,'IT',41.074,14.3328);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(15,'province','NA','Napoli','Campania',NULL,'IT',40.8518,14.2681);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(16,'province','SA','Salerno','Campania',NULL,'IT',40.6824,14.7681);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(17,'province','BO','Bologna','Emilia-Romagna',NULL,'IT',44.4949,11.3426);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(18,'province','FE','Ferrara','Emilia-Romagna',NULL,'IT',44.8381,11.6198);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(19,'province','FC','Forlì-Cesena','Emilia-Romagna',NULL,'IT',44.2227,12.0408);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(20,'province','MO','Modena','Emilia-Romagna',NULL,'IT',44.6471,10.9252);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(21,'province','PR','Parma','Emilia-Romagna',NULL,'IT',44.8015,10.3279);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(22,'province','PC','Piacenza','Emilia-Romagna',NULL,'IT',45.0526,9.6934);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(23,'province','RA','Ravenna','Emilia-Romagna',NULL,'IT',44.4184,12.2035);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(24,'province','RN','Rimini','Emilia-Romagna',NULL,'IT',44.0678,12.5695);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(25,'province','RE','Reggio Emilia','Emilia-Romagna',NULL,'IT',44.6989,10.6297);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(26,'province','GO','Gorizia','Friuli-Venezia Giulia',NULL,'IT',45.9403,13.6217);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(27,'province','PN','Pordenone','Friuli-Venezia Giulia',NULL,'IT',45.9561,12.6612);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(28,'province','TS','Trieste','Friuli-Venezia Giulia',NULL,'IT',45.6495,13.7768);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(29,'province','UD','Udine','Friuli-Venezia Giulia',NULL,'IT',46.0711,13.235);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(30,'province','FR','Frosinone','Lazio',NULL,'IT',41.639,13.3395);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(31,'province','LT','Latina','Lazio',NULL,'IT',41.4677,12.9036);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(32,'province','RI','Rieti','Lazio',NULL,'IT',42.4044,12.8628);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(33,'province','RM','Roma','Lazio',NULL,'IT',41.9028,12.4964);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(34,'province','VT','Viterbo','Lazio',NULL,'IT',42.4171,12.1065);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(35,'province','GE','Genova','Liguria',NULL,'IT',44.4056,8.9463);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(36,'province','IM','Imperia','Liguria',NULL,'IT',43.8923,8.0307);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(37,'province','SP','La Spezia','Liguria',NULL,'IT',44.1077,9.8227);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(38,'province','SV','Savona','Liguria',NULL,'IT',44.3077,8.4822);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(39,'province','BG','Bergamo','Lombardia',NULL,'IT',45.6983,9.6773);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(40,'province','BS','Brescia','Lombardia',NULL,'IT',45.5416,10.2118);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(41,'province','CO','Como','Lombardia',NULL,'IT',45.8081,9.0852);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(42,'province','CR','Cremona','Lombardia',NULL,'IT',45.1349,10.0218);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(43,'province','LC','Lecco','Lombardia',NULL,'IT',45.8566,9.3904);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(44,'province','LO','Lodi','Lombardia',NULL,'IT',45.3147,9.5037);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(45,'province','MN','Mantova','Lombardia',NULL,'IT',45.1564,10.7914);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(46,'province','MI','Milano','Lombardia',NULL,'IT',45.4654,9.1859);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(47,'province','MB','Monza-Brianza','Lombardia',NULL,'IT',45.5845,9.2744);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(48,'province','PV','Pavia','Lombardia',NULL,'IT',45.1847,9.1582);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(49,'province','SO','Sondrio','Lombardia',NULL,'IT',46.1697,9.8703);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(50,'province','VA','Varese','Lombardia',NULL,'IT',45.8206,8.8257);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(51,'province','AN','Ancona','Marche',NULL,'IT',43.6158,13.5189);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(52,'province','AP','Ascoli Piceno','Marche',NULL,'IT',42.8637,13.5795);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(53,'province','FM','Fermo','Marche',NULL,'IT',43.1601,13.7229);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(54,'province','MC','Macerata','Marche',NULL,'IT',43.2998,13.4533);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(55,'province','PU','Pesaro-Urbino','Marche',NULL,'IT',43.873,12.9135);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(56,'province','CB','Campobasso','Molise',NULL,'IT',41.5606,14.6637);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(57,'province','IS','Isernia','Molise',NULL,'IT',41.5925,14.2307);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(58,'province','AL','Alessandria','Piemonte',NULL,'IT',44.9136,8.615);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(59,'province','AT','Asti','Piemonte',NULL,'IT',44.9003,8.2064);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(60,'province','BI','Biella','Piemonte',NULL,'IT',45.5624,8.0585);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(61,'province','CN','Cuneo','Piemonte',NULL,'IT',44.3844,7.5425);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(62,'province','NO','Novara','Piemonte',NULL,'IT',45.4455,8.6219);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(63,'province','TO','Torino','Piemonte',NULL,'IT',45.0703,7.6869);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(64,'province','VB','Verbano-Cusio-Ossola','Piemonte',NULL,'IT',45.9291,8.5766);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(65,'province','VC','Vercelli','Piemonte',NULL,'IT',45.3206,8.4181);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(66,'province','BA','Bari','Puglia',NULL,'IT',41.1171,16.8719);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(67,'province','BT','Barletta-Andria-Trani','Puglia',NULL,'IT',41.2003,16.2948);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(68,'province','BR','Brindisi','Puglia',NULL,'IT',40.6328,17.9409);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(69,'province','FG','Foggia','Puglia',NULL,'IT',41.4621,15.5446);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(70,'province','LE','Lecce','Puglia',NULL,'IT',40.352,18.1742);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(71,'province','TA','Taranto','Puglia',NULL,'IT',40.4644,17.247);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(72,'province','CA','Cagliari','Sardegna',NULL,'IT',39.2238,9.1217);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(73,'province','CI','Carbonia-Iglesias','Sardegna',NULL,'IT',39.1668,8.5329);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(74,'province','VS','Medio Campidano','Sardegna',NULL,'IT',39.5298,8.7362);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(75,'province','NU','Nuoro','Sardegna',NULL,'IT',40.3214,9.3268);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(76,'province','OG','Ogliastra','Sardegna',NULL,'IT',39.688,9.5039);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(77,'province','OT','Olbia-Tempio','Sardegna',NULL,'IT',40.9237,9.4992);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(78,'province','OR','Oristano','Sardegna',NULL,'IT',39.906,8.5917);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(79,'province','SS','Sassari','Sardegna',NULL,'IT',40.7259,8.5555);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(80,'province','AG','Agrigento','Sicilia',NULL,'IT',37.3111,13.5765);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(81,'province','CL','Caltanissetta','Sicilia',NULL,'IT',37.4908,14.0632);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(82,'province','CT','Catania','Sicilia',NULL,'IT',37.5079,15.083);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(83,'province','EN','Enna','Sicilia',NULL,'IT',37.5667,14.277);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(84,'province','ME','Messina','Sicilia',NULL,'IT',38.1938,15.554);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(85,'province','PA','Palermo','Sicilia',NULL,'IT',38.1157,13.3615);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(86,'province','RG','Ragusa','Sicilia',NULL,'IT',36.9268,14.7276);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(87,'province','SR','Siracusa','Sicilia',NULL,'IT',37.0755,15.2866);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(88,'province','TP','Trapani','Sicilia',NULL,'IT',37.9992,12.5363);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(89,'province','AR','Arezzo','Toscana',NULL,'IT',43.4633,11.8796);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(90,'province','FI','Firenze','Toscana',NULL,'IT',43.7696,11.2558);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(91,'province','GR','Grosseto','Toscana',NULL,'IT',42.7637,11.1117);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(92,'province','LI','Livorno','Toscana',NULL,'IT',43.5485,10.3106);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(93,'province','LU','Lucca','Toscana',NULL,'IT',43.843,10.5074);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(94,'province','MS','Massa-Carrara','Toscana',NULL,'IT',44.0318,10.1429);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(95,'province','PI','Pisa','Toscana',NULL,'IT',43.7228,10.4017);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(96,'province','PT','Pistoia','Toscana',NULL,'IT',43.93,10.9175);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(97,'province','PO','Prato','Toscana',NULL,'IT',43.8777,11.1023);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(98,'province','SI','Siena','Toscana',NULL,'IT',43.3186,11.3307);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(99,'province','BZ','Bolzano','Trentino-Alto Adige',NULL,'IT',46.4983,11.3548);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(100,'province','TN','Trento','Trentino-Alto Adige',NULL,'IT',46.0664,11.1257);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(101,'province','PG','Perugia','Umbria',NULL,'IT',43.1107,12.3908);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(102,'province','TR','Terni','Umbria',NULL,'IT',42.5636,12.643);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(103,'province','AO','Aosta','Valle d''Aosta',NULL,'IT',45.7372,7.3202);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(104,'province','BL','Belluno','Veneto',NULL,'IT',46.1411,12.2159);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(105,'province','PD','Padova','Veneto',NULL,'IT',45.4064,11.8768);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(106,'province','RO','Rovigo','Veneto',NULL,'IT',45.0714,11.7906);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(107,'province','TV','Treviso','Veneto',NULL,'IT',45.6669,12.243);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(108,'province','VE','Venezia','Veneto',NULL,'IT',45.4408,12.3155);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(109,'province','VR','Verona','Veneto',NULL,'IT',45.4386,10.9916);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(110,'province','VI','Vicenza','Veneto',NULL,'IT',45.5455,11.5354);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(111,'capitali_eu','Amsterdam','Amsterdam',NULL,'Paesi Bassi','NL',52.3676,4.9041);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(112,'capitali_eu','Andorra la Vella','Andorra la Vella',NULL,'Andorra','AD',42.5063,1.5218);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(113,'capitali_eu','Atene','Atene',NULL,'Grecia','GR',37.9838,23.7275);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(114,'capitali_eu','Baku','Baku',NULL,'Azerbaigian','AZ',40.4093,49.8671);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(115,'capitali_eu','Belgrado','Belgrado',NULL,'Serbia','RS',44.8176,20.4569);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(116,'capitali_eu','Berlino','Berlino',NULL,'Germania','DE',52.52,13.405);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(117,'capitali_eu','Berna','Berna',NULL,'Svizzera','CH',46.948,7.4474);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(118,'capitali_eu','Bratislava','Bratislava',NULL,'Slovacchia','SK',48.1486,17.1077);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(119,'capitali_eu','Bruxelles','Bruxelles',NULL,'Belgio','BE',50.8503,4.3517);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(120,'capitali_eu','Bucarest','Bucarest',NULL,'Romania','RO',44.4268,26.1025);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(121,'capitali_eu','Budapest','Budapest',NULL,'Ungheria','HU',47.4979,19.0402);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(122,'capitali_eu','Chisinau','Chisinau',NULL,'Moldova','MD',47.0105,28.8638);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(123,'capitali_eu','Copenaghen','Copenaghen',NULL,'Danimarca','DK',55.6761,12.5683);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(124,'capitali_eu','Dublino','Dublino',NULL,'Irlanda','IE',53.3498,-6.2603);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(125,'capitali_eu','Helsinki','Helsinki',NULL,'Finlandia','FI',60.1699,24.9384);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(126,'capitali_eu','Kiev','Kiev',NULL,'Ucraina','UA',50.4501,30.5234);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(127,'capitali_eu','Lisbona','Lisbona',NULL,'Portogallo','PT',38.7223,-9.1393);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(128,'capitali_eu','Lubiana','Lubiana',NULL,'Slovenia','SI',46.0569,14.5058);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(129,'capitali_eu','Lussemburgo','Lussemburgo',NULL,'Lussemburgo','LU',49.6116,6.1319);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(130,'capitali_eu','Madrid','Madrid',NULL,'Spagna','ES',40.4168,-3.7038);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(131,'capitali_eu','Minsk','Minsk',NULL,'Bielorussia','BY',53.9045,27.5615);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(132,'capitali_eu','Monaco','Monaco',NULL,'Monaco','MC',43.7384,7.4246);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(133,'capitali_eu','Mosca','Mosca',NULL,'Russia','RU',55.7558,37.6173);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(134,'capitali_eu','Nicosia','Nicosia',NULL,'Cipro','CY',35.1856,33.3823);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(135,'capitali_eu','Oslo','Oslo',NULL,'Norvegia','NO',59.9139,10.7522);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(136,'capitali_eu','Parigi','Parigi',NULL,'Francia','FR',48.8566,2.3522);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(137,'capitali_eu','Podgorica','Podgorica',NULL,'Montenegro','ME',42.4304,19.2594);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(138,'capitali_eu','Praga','Praga',NULL,'Repubblica Ceca','CZ',50.0755,14.4378);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(139,'capitali_eu','Reykjavik','Reykjavik',NULL,'Islanda','IS',64.1265,-21.8174);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(140,'capitali_eu','Riga','Riga',NULL,'Lettonia','LV',56.9496,24.1052);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(141,'capitali_eu','Roma','Roma',NULL,'Italia','IT',41.9028,12.4964);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(142,'capitali_eu','San Marino','San Marino',NULL,'San Marino','SM',43.9424,12.4578);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(143,'capitali_eu','Sarajevo','Sarajevo',NULL,'Bosnia-Erzegovina','BA',43.8563,18.4131);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(144,'capitali_eu','Skopje','Skopje',NULL,'Macedonia del Nord','MK',41.9981,21.4254);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(145,'capitali_eu','Sofia','Sofia',NULL,'Bulgaria','BG',42.6977,23.3219);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(146,'capitali_eu','Stoccolma','Stoccolma',NULL,'Svezia','SE',59.3293,18.0686);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(147,'capitali_eu','Tallinn','Tallinn',NULL,'Estonia','EE',59.437,24.7536);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(148,'capitali_eu','Tirana','Tirana',NULL,'Albania','AL',41.3275,19.8187);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(149,'capitali_eu','Vaduz','Vaduz',NULL,'Liechtenstein','LI',47.141,9.5215);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(150,'capitali_eu','Valletta','Valletta',NULL,'Malta','MT',35.8997,14.5147);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(151,'capitali_eu','Varsavia','Varsavia',NULL,'Polonia','PL',52.2297,21.0122);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(152,'capitali_eu','Vienna','Vienna',NULL,'Austria','AT',48.2082,16.3738);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(153,'capitali_eu','Vilnius','Vilnius',NULL,'Lituania','LT',54.6872,25.2797);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(154,'capitali_eu','Zagabria','Zagabria',NULL,'Croazia','HR',45.815,15.9819);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(155,'capitali_mondo','Abidjan','Abidjan','Africa','Costa d''Avorio','CI',5.36,-4.0083);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(156,'capitali_mondo','Abuja','Abuja','Africa','Nigeria','NG',9.0765,7.3986);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(157,'capitali_mondo','Accra','Accra','Africa','Ghana','GH',5.6037,-0.187);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(158,'capitali_mondo','Addis Abeba','Addis Abeba','Africa','Etiopia','ET',9.032,38.7469);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(159,'capitali_mondo','Algeri','Algeri','Africa','Algeria','DZ',36.7372,3.0865);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(160,'capitali_mondo','Antananarivo','Antananarivo','Africa','Madagascar','MG',-18.9137,47.5361);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(161,'capitali_mondo','Asmara','Asmara','Africa','Eritrea','ER',15.3229,38.9251);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(162,'capitali_mondo','Bamako','Bamako','Africa','Mali','ML',12.6392,-8.0029);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(163,'capitali_mondo','Bangui','Bangui','Africa','Rep. Centrafricana','CF',4.3612,18.555);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(164,'capitali_mondo','Banjul','Banjul','Africa','Gambia','GM',13.4531,-16.5775);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(165,'capitali_mondo','Bissau','Bissau','Africa','Guinea-Bissau','GW',11.8636,-15.5977);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(166,'capitali_mondo','Brazzaville','Brazzaville','Africa','Rep. del Congo','CG',-4.2634,15.2429);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(167,'capitali_mondo','Bujumbura','Bujumbura','Africa','Burundi','BI',-3.3731,29.3644);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(168,'capitali_mondo','Cairo','Cairo','Africa','Egitto','EG',30.0444,31.2357);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(169,'capitali_mondo','Città del Capo','Città del Capo','Africa','Sudafrica','ZA',-33.9249,18.4241);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(170,'capitali_mondo','Conakry','Conakry','Africa','Guinea','GN',9.537,-13.6773);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(171,'capitali_mondo','Cotonou','Cotonou','Africa','Benin','BJ',6.3654,2.3912);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(172,'capitali_mondo','Dakar','Dakar','Africa','Senegal','SN',14.7167,-17.4677);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(173,'capitali_mondo','Djibouti','Djibouti','Africa','Gibuti','DJ',11.5721,43.1456);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(174,'capitali_mondo','Dodoma','Dodoma','Africa','Tanzania','TZ',-6.173,35.7395);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(175,'capitali_mondo','Freetown','Freetown','Africa','Sierra Leone','SL',8.4897,-13.2344);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(176,'capitali_mondo','Gaborone','Gaborone','Africa','Botswana','BW',-24.6282,25.9231);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(177,'capitali_mondo','Harare','Harare','Africa','Zimbabwe','ZW',-17.8252,31.0335);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(178,'capitali_mondo','Juba','Juba','Africa','Sudan del Sud','SS',4.8594,31.5713);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(179,'capitali_mondo','Kampala','Kampala','Africa','Uganda','UG',0.3476,32.5825);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(180,'capitali_mondo','Khartoum','Khartoum','Africa','Sudan','SD',15.5007,32.5599);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(181,'capitali_mondo','Kigali','Kigali','Africa','Ruanda','RW',-1.9441,30.0619);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(182,'capitali_mondo','Kinshasa','Kinshasa','Africa','Rep. Dem. Congo','CD',-4.3217,15.3222);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(183,'capitali_mondo','Lagos','Lagos','Africa','Nigeria','NG',6.5244,3.3792);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(184,'capitali_mondo','Libreville','Libreville','Africa','Gabon','GA',0.4162,9.4673);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(185,'capitali_mondo','Lilongwe','Lilongwe','Africa','Malawi','MW',-13.9669,33.7873);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(186,'capitali_mondo','Lomé','Lomé','Africa','Togo','TG',6.1228,1.2255);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(187,'capitali_mondo','Luanda','Luanda','Africa','Angola','AO',-8.8368,13.2343);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(188,'capitali_mondo','Lusaka','Lusaka','Africa','Zambia','ZM',-15.4167,28.2833);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(189,'capitali_mondo','Malabo','Malabo','Africa','Guinea Equatoriale','GQ',3.7523,8.7741);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(190,'capitali_mondo','Maputo','Maputo','Africa','Mozambico','MZ',-25.9692,32.5732);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(191,'capitali_mondo','Maseru','Maseru','Africa','Lesotho','LS',-29.3167,27.4833);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(192,'capitali_mondo','Mbabane','Mbabane','Africa','Eswatini','SZ',-26.3167,31.1333);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(193,'capitali_mondo','Mogadiscio','Mogadiscio','Africa','Somalia','SO',2.0469,45.3182);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(194,'capitali_mondo','Monrovia','Monrovia','Africa','Liberia','LR',6.3106,-10.8047);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(195,'capitali_mondo','Moroni','Moroni','Africa','Comore','KM',-11.7022,43.2551);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(196,'capitali_mondo','Nairobi','Nairobi','Africa','Kenya','KE',-1.2921,36.8219);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(197,'capitali_mondo','Ndjamena','Ndjamena','Africa','Ciad','TD',12.1048,15.0445);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(198,'capitali_mondo','Niamey','Niamey','Africa','Niger','NE',13.5137,2.1098);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(199,'capitali_mondo','Nouakchott','Nouakchott','Africa','Mauritania','MR',18.0735,-15.9582);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(200,'capitali_mondo','Ouagadougou','Ouagadougou','Africa','Burkina Faso','BF',12.3714,-1.5197);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(201,'capitali_mondo','Porto-Novo','Porto-Novo','Africa','Benin','BJ',6.3703,2.3912);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(202,'capitali_mondo','Praia','Praia','Africa','Capo Verde','CV',14.9305,-23.5133);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(203,'capitali_mondo','Pretoria','Pretoria','Africa','Sudafrica','ZA',-25.7479,28.2293);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(204,'capitali_mondo','Rabat','Rabat','Africa','Marocco','MA',34.0132,-6.8326);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(205,'capitali_mondo','São Tomé','São Tomé','Africa','São Tomé e Príncipe','ST',0.3365,6.7273);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(206,'capitali_mondo','Tripoli','Tripoli','Africa','Libia','LY',32.8872,13.1913);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(207,'capitali_mondo','Tunisi','Tunisi','Africa','Tunisia','TN',36.819,10.1658);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(208,'capitali_mondo','Windhoek','Windhoek','Africa','Namibia','NA',-22.5597,17.0832);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(209,'capitali_mondo','Yamoussoukro','Yamoussoukro','Africa','Costa d''Avorio','CI',6.8206,-5.2767);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(210,'capitali_mondo','Yaoundé','Yaoundé','Africa','Camerun','CM',3.848,11.5021);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(211,'capitali_mondo','Asunción','Asunción','Americhe','Paraguay','PY',-25.2867,-57.647);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(212,'capitali_mondo','Bogotà','Bogotà','Americhe','Colombia','CO',4.711,-74.0721);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(213,'capitali_mondo','Brasilia','Brasilia','Americhe','Brasile','BR',-15.8267,-47.9218);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(214,'capitali_mondo','Buenos Aires','Buenos Aires','Americhe','Argentina','AR',-34.6037,-58.3816);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(215,'capitali_mondo','Caracas','Caracas','Americhe','Venezuela','VE',10.4806,-66.9036);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(216,'capitali_mondo','Cayenna','Cayenna','Americhe','Guyana Francese','GF',4.9224,-52.3135);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(217,'capitali_mondo','Georgetown','Georgetown','Americhe','Guyana','GY',6.8013,-58.1551);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(218,'capitali_mondo','Guatemala City','Guatemala City','Americhe','Guatemala','GT',14.6349,-90.5069);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(219,'capitali_mondo','L''Avana','L''Avana','Americhe','Cuba','CU',23.1136,-82.3666);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(220,'capitali_mondo','La Paz','La Paz','Americhe','Bolivia','BO',-16.5,-68.15);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(221,'capitali_mondo','Lima','Lima','Americhe','Perù','PE',-12.0464,-77.0428);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(222,'capitali_mondo','Managua','Managua','Americhe','Nicaragua','NI',12.1149,-86.2362);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(223,'capitali_mondo','Mexico City','Mexico City','Americhe','Messico','MX',19.4326,-99.1332);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(224,'capitali_mondo','Montevideo','Montevideo','Americhe','Uruguay','UY',-34.9011,-56.1645);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(225,'capitali_mondo','Nassau','Nassau','Americhe','Bahamas','BS',25.048,-77.3554);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(226,'capitali_mondo','Ottawa','Ottawa','Americhe','Canada','CA',45.4215,-75.6972);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(227,'capitali_mondo','Panama City','Panama City','Americhe','Panama','PA',8.9936,-79.5197);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(228,'capitali_mondo','Paramaribo','Paramaribo','Americhe','Suriname','SR',5.8664,-55.1668);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(229,'capitali_mondo','Port-au-Prince','Port-au-Prince','Americhe','Haiti','HT',18.5944,-72.3074);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(230,'capitali_mondo','Port of Spain','Port of Spain','Americhe','Trinidad e Tobago','TT',10.6596,-61.5189);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(231,'capitali_mondo','Quito','Quito','Americhe','Ecuador','EC',-0.1807,-78.4678);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(232,'capitali_mondo','San José','San José','Americhe','Costa Rica','CR',9.9281,-84.0907);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(233,'capitali_mondo','San Salvador','San Salvador','Americhe','El Salvador','SV',13.6929,-89.2182);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(234,'capitali_mondo','Santiago','Santiago','Americhe','Cile','CL',-33.4489,-70.6693);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(235,'capitali_mondo','Santo Domingo','Santo Domingo','Americhe','Rep. Dominicana','DO',18.4861,-69.9312);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(236,'capitali_mondo','Tegucigalpa','Tegucigalpa','Americhe','Honduras','HN',14.0723,-87.2062);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(237,'capitali_mondo','Washington D.C.','Washington D.C.','Americhe','USA','US',38.9072,-77.0369);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(238,'capitali_mondo','Abu Dhabi','Abu Dhabi','Asia','Emirati Arabi','AE',24.4539,54.3773);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(239,'capitali_mondo','Amman','Amman','Asia','Giordania','JO',31.9454,35.9284);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(240,'capitali_mondo','Ankara','Ankara','Asia','Turchia','TR',39.9334,32.8597);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(241,'capitali_mondo','Astana','Astana','Asia','Kazakhstan','KZ',51.1801,71.446);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(242,'capitali_mondo','Baghdad','Baghdad','Asia','Iraq','IQ',33.3152,44.3661);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(243,'capitali_mondo','Baku','Baku','Asia','Azerbaigian','AZ',40.4093,49.8671);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(244,'capitali_mondo','Bangkok','Bangkok','Asia','Thailandia','TH',13.7563,100.5018);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(245,'capitali_mondo','Beirut','Beirut','Asia','Libano','LB',33.8938,35.5018);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(246,'capitali_mondo','Bishkek','Bishkek','Asia','Kirghizistan','KG',42.8746,74.5698);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(247,'capitali_mondo','Colombo','Colombo','Asia','Sri Lanka','LK',6.9271,79.8612);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(248,'capitali_mondo','Damasco','Damasco','Asia','Siria','SY',33.5138,36.2765);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(249,'capitali_mondo','Dhaka','Dhaka','Asia','Bangladesh','BD',23.8103,90.4125);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(250,'capitali_mondo','Dili','Dili','Asia','Timor Est','TL',-8.5569,125.5603);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(251,'capitali_mondo','Doha','Doha','Asia','Qatar','QA',25.2854,51.531);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(252,'capitali_mondo','Dubai','Dubai','Asia','Emirati Arabi','AE',25.2048,55.2708);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(253,'capitali_mondo','Dushanbe','Dushanbe','Asia','Tagikistan','TJ',38.5598,68.787);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(254,'capitali_mondo','Hanoi','Hanoi','Asia','Vietnam','VN',21.0278,105.8342);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(255,'capitali_mondo','Islamabad','Islamabad','Asia','Pakistan','PK',33.6844,73.0479);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(256,'capitali_mondo','Jakarta','Jakarta','Asia','Indonesia','ID',-6.2088,106.8456);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(257,'capitali_mondo','Kabul','Kabul','Asia','Afghanistan','AF',34.5553,69.2075);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(258,'capitali_mondo','Kathmandu','Kathmandu','Asia','Nepal','NP',27.7172,85.324);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(259,'capitali_mondo','Kuala Lumpur','Kuala Lumpur','Asia','Malaysia','MY',3.139,101.6869);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(260,'capitali_mondo','Kuwait City','Kuwait City','Asia','Kuwait','KW',29.3759,47.9774);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(261,'capitali_mondo','Manila','Manila','Asia','Filippine','PH',14.5995,120.9842);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(262,'capitali_mondo','Manama','Manama','Asia','Bahrein','BH',26.2154,50.5832);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(263,'capitali_mondo','Muscat','Muscat','Asia','Oman','OM',23.588,58.3829);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(264,'capitali_mondo','Naypyidaw','Naypyidaw','Asia','Myanmar','MM',19.7633,96.0785);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(265,'capitali_mondo','New Delhi','New Delhi','Asia','India','IN',28.6139,77.209);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(266,'capitali_mondo','Pechino','Pechino','Asia','Cina','CN',39.9042,116.4074);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(267,'capitali_mondo','Phnom Penh','Phnom Penh','Asia','Cambogia','KH',11.5564,104.9282);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(268,'capitali_mondo','Pyongyang','Pyongyang','Asia','Corea del Nord','KP',39.0392,125.7625);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(269,'capitali_mondo','Riyadh','Riyadh','Asia','Arabia Saudita','SA',24.7136,46.6753);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(270,'capitali_mondo','Seoul','Seoul','Asia','Corea del Sud','KR',37.5665,126.978);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(271,'capitali_mondo','Singapore','Singapore','Asia','Singapore','SG',1.3521,103.8198);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(272,'capitali_mondo','Taipei','Taipei','Asia','Taiwan','TW',25.033,121.5654);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(273,'capitali_mondo','Taskent','Taskent','Asia','Uzbekistan','UZ',41.2995,69.2401);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(274,'capitali_mondo','Tehran','Tehran','Asia','Iran','IR',35.6892,51.389);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(275,'capitali_mondo','Thimphu','Thimphu','Asia','Bhutan','BT',27.4728,89.639);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(276,'capitali_mondo','Tokyo','Tokyo','Asia','Giappone','JP',35.6762,139.6503);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(277,'capitali_mondo','Ulan Bator','Ulan Bator','Asia','Mongolia','MN',47.8864,106.9057);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(278,'capitali_mondo','Vientiane','Vientiane','Asia','Laos','LA',17.9757,102.6331);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(279,'capitali_mondo','Yangon','Yangon','Asia','Myanmar','MM',16.8409,96.1735);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(280,'capitali_mondo','Yerevan','Yerevan','Asia','Armenia','AM',40.1811,44.5136);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(281,'capitali_mondo','Apia','Apia','Oceania','Samoa','WS',-13.8506,-171.7514);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(282,'capitali_mondo','Canberra','Canberra','Oceania','Australia','AU',-35.2809,149.13);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(283,'capitali_mondo','Funafuti','Funafuti','Oceania','Tuvalu','TV',-8.5211,179.1983);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(284,'capitali_mondo','Honiara','Honiara','Oceania','Isole Salomone','SB',-9.4333,160.0333);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(285,'capitali_mondo','Majuro','Majuro','Oceania','Isole Marshall','MH',7.1164,171.1858);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(286,'capitali_mondo','Nuku''alofa','Nuku''alofa','Oceania','Tonga','TO',-21.1393,-175.2049);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(287,'capitali_mondo','Palikir','Palikir','Oceania','Micronesia','FM',6.9248,158.161);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(288,'capitali_mondo','Port Moresby','Port Moresby','Oceania','Papua Nuova Guinea','PG',-9.4438,147.1803);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(289,'capitali_mondo','Port Vila','Port Vila','Oceania','Vanuatu','VU',-17.7333,168.3167);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(290,'capitali_mondo','South Tarawa','South Tarawa','Oceania','Kiribati','KI',1.3278,172.9756);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(291,'capitali_mondo','Suva','Suva','Oceania','Fiji','FJ',-18.1416,178.4419);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(292,'capitali_mondo','Wellington','Wellington','Oceania','Nuova Zelanda','NZ',-41.2866,174.7756);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(293,'capitali_mondo','Gerusalemme','Gerusalemme','Asia','Israele','IL',31.7683,35.2137);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(294,'capitali_mondo','Tel Aviv','Tel Aviv','Asia','Israele','IL',32.0853,34.7818);
INSERT INTO "wandex_catalogo" ("id","categoria","chiave","nome","gruppo","paese","iso","lat","lng") VALUES(295,'capitali_mondo','Nicosia','Nicosia','Asia','Cipro','CY',35.1856,33.3823);
DELETE FROM sqlite_sequence;
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('viaggi',8);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('tappe',212);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('giorni',24);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('attivita',101);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('checklist_voci',13);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('utenti',1);
INSERT INTO "sqlite_sequence" ("name","seq") VALUES('wandex_catalogo',295);
