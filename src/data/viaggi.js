const viaggi = [
  {
    id: 1,
    titolo: "Cina & Hong Kong",
    stato: "futuro",
    data_inizio: "2026-08-21",
    data_fine: "2026-09-08",
    descrizione: "18 giorni, tutto su rotaia. Nessun volo interno.",
    note: `**Voli**
- Andata: 21 ago MXP → BRU (SN3154) → PEK (HU0492) · PNR ZI8TCU · arrivo 22 ago 05:00
- Ritorno: 7 set HKG → HAN (VN0593 14:30) · scalo 9h15 · HAN → MXP (VN0073 00:50) · PNR XLGNLT

**App essenziali da installare prima di partire**
WeChat · Alipay · Didi · Trip.com · VPN

**Treni**
Tutti prenotabili su Trip.com con passaporto`,

    checklist_partenza: [
      { voce: "Visto Cina (tipo L, ~60-80€)", completata: false },
      { voce: "VPN installata e testata", completata: false },
      { voce: "WeChat attivato", completata: false },
      { voce: "Alipay attivato", completata: false },
      { voce: "Assicurazione viaggio", completata: false },
      { voce: "Città Proibita — biglietti WeChat", completata: false },
      { voce: "Grande Muraglia Mutianyu — mutianyugreatwall.com", completata: false },
      { voce: "Esercito di Terracotta — bmy.com.cn", completata: false },
      { voce: "Grotte di Yungang — WeChat", completata: false },
      { voce: "Crociera Li River — WeChat Lijiang Ticketing Office", completata: false },
      { voce: "Cable car Ngong Ping Lantau — prenotare online", completata: false },
      { voce: "Yuan cinesi e dollari HK", completata: false },
    ],

    tappe: [
      {
        id: 101,
        nome: "Pechino",
        paese: "Cina",
        lat: 39.9163,
        lng: 116.3972,
        ordine: 1,
        data_arrivo: "2026-08-22",
        data_partenza: "2026-08-25",
        notti: 3,
        hotel: { nome: "", indirizzo: "", link: "" },
        stazione: { nome: "Pechino Nord", note: "Partenza 25 ago ore 07:30" },
        note: "Arrivo volo HU0492 ore 05:00 T2. Jet lag 6h — previsto riposo mattina.",
        trasporto_arrivo: "Volo HU0492 BRU → PEK · arrivo 22 ago 05:00",
        trasporto_partenza: "AV Pechino Nord → Datong Sud · 07:30 · 25 agosto",
        giorni: [
          {
            numero: 1,
            titolo: "Arrivo e orientamento",
            data: "2026-08-22",
            attivita: [
              { ora: "05:00", nome: "Arrivo Pechino T2", note: "Bagagli, yuan, SIM cinese." },
              { ora: "09:00", nome: "Riposo", note: "3-4h — jet lag di 6 ore." },
              { ora: "14:00", nome: "Tempio dei Lama Yonghe", note: "Il tempio lamaista più importante di Pechino.", tipo: "attrazione" },
              { ora: "16:00", nome: "Torri del Tamburo e della Campana", tipo: "attrazione" },
              { ora: "18:00", nome: "Hutong Nanluoguxiang", tipo: "attrazione" },
              { ora: "19:30", nome: "Cena a Lago Houhai", tipo: "cibo" },
            ]
          },
          {
            numero: 2,
            titolo: "Asse imperiale",
            data: "2026-08-23",
            attivita: [
              { ora: "07:30", nome: "Piazza Tiananmen", tipo: "attrazione", avviso: "Prenotare su WeChat in anticipo" },
              { ora: "09:00", nome: "Città Proibita", note: "3-4h.", tipo: "attrazione", avviso: "Biglietti nominali — esaurimento rapido" },
              { ora: "13:00", nome: "Parco Jingshan", note: "Vista sulla Città Proibita.", tipo: "attrazione" },
              { ora: "15:30", nome: "Tempio del Cielo", note: "~2h.", tipo: "attrazione" },
              { ora: "18:30", nome: "Sera a Lago Houhai", tipo: "cibo" },
            ]
          },
          {
            numero: 3,
            titolo: "Grande Muraglia",
            data: "2026-08-24",
            attivita: [
              { ora: "07:00", nome: "Partenza per Mutianyu", note: "~1h30.", tipo: "logistica", avviso: "Biglietti su mutianyugreatwall.com" },
              { ora: "08:30", nome: "Grande Muraglia di Mutianyu", note: "Funivia inclusa.", tipo: "attrazione" },
              { ora: "11:00", nome: "Toboggan sulla Muraglia", note: "~15 min.", tipo: "attrazione" },
              { ora: "13:30", nome: "Rientro a Pechino", tipo: "logistica" },
              { ora: "15:30", nome: "Pomeriggio libero" },
              { ora: "20:00", nome: "Preparativi", note: "Treno domani 07:30 da Pechino Nord.", tipo: "logistica" },
            ]
          }
        ]
      },
      {
        id: 102,
        nome: "Datong",
        paese: "Cina",
        lat: 40.0767,
        lng: 113.2945,
        ordine: 2,
        data_arrivo: "2026-08-25",
        data_partenza: "2026-08-26",
        notti: 1,
        hotel: { nome: "", indirizzo: "", link: "" },
        stazione: { nome: "Datong Sud", note: "Arrivo 25 ago · partenza 26 ago 06:58" },
        note: "Giornata con taxi privato ~350 yuan.",
        trasporto_arrivo: "AV Pechino Nord → Datong Sud · 07:30 · 25 agosto",
        trasporto_partenza: "AV Datong Sud → Xi'an · 06:58 · 26 agosto",
        giorni: [
          {
            numero: 1,
            titolo: "Giornata con taxi privato",
            data: "2026-08-25",
            attivita: [
              { ora: "09:15", nome: "Arrivo Datong Sud", note: "~350 yuan taxi privato.", tipo: "logistica" },
              { ora: "10:00", nome: "Tempio Sospeso Xuankong Si", note: "~1h30 trasferimento. Visita ~1h30.", tipo: "attrazione", avviso: "Biglietti WeChat" },
              { ora: "14:30", nome: "Grotte di Yungang UNESCO", note: "~2h trasferimento. Visita 2h30-3h.", tipo: "attrazione", avviso: "Biglietti nominali WeChat — prenotare prima" },
              { ora: "17:30", nome: "Rientro a Datong", tipo: "logistica" },
              { ora: "19:30", nome: "Cena: dao xiao mian", tipo: "cibo" },
            ]
          }
        ]
      },
      {
        id: 103,
        nome: "Xi'an",
        paese: "Cina",
        lat: 34.2604,
        lng: 108.9486,
        ordine: 3,
        data_arrivo: "2026-08-26",
        data_partenza: "2026-08-28",
        notti: 2,
        hotel: { nome: "KAJU Hotel", indirizzo: "", link: "" },
        stazione: { nome: "Xi'an North Station", note: "Partenza 28 ago sera" },
        trasporto_arrivo: "AV Datong Sud → Xi'an · 06:58 · 26 agosto",
        trasporto_partenza: "AV Xi'an → Changsha · sera 28 agosto · ~5h",
        giorni: [
          {
            numero: 1,
            titolo: "Arrivo e città antica",
            data: "2026-08-26",
            attivita: [
              { ora: "11:30", nome: "Arrivo da Datong", note: "AV ~4h30.", tipo: "logistica" },
              { ora: "13:30", nome: "Quartiere Musulmano", note: "Street food: roujiamo, biang biang noodles.", tipo: "cibo" },
              { ora: "16:00", nome: "Torre della Campana e Torre del Tamburo", tipo: "attrazione" },
              { ora: "19:30", nome: "Cena", tipo: "cibo" },
            ]
          },
          {
            numero: 2,
            titolo: "Terracotta e mura",
            data: "2026-08-27",
            attivita: [
              { ora: "07:30", nome: "Partenza per Terracotta", note: "Bus turistico n.5.", tipo: "logistica", avviso: "Biglietti nominali bmy.com.cn · 150 yuan" },
              { ora: "09:00", nome: "Esercito di Terracotta", note: "3 fosse. ~3h.", tipo: "attrazione" },
              { ora: "15:00", nome: "Mura della città in bici", note: "~1h30 giro completo.", tipo: "attrazione" },
              { ora: "19:00", nome: "Cena e riposo", tipo: "cibo" },
            ]
          },
          {
            numero: 3,
            titolo: "Giornata libera e partenza",
            data: "2026-08-28",
            attivita: [
              { ora: "09:00", nome: "Grande Moschea di Xi'an", note: "Una delle più antiche d'Asia. ~1h.", tipo: "attrazione" },
              { ora: "11:00", nome: "Museo di Storia dello Shaanxi", note: "Collezione Tang straordinaria. ~2h. Gratuito.", tipo: "attrazione" },
              { ora: "14:00", nome: "Pomeriggio libero", note: "Shopping Huimin Street." },
              { ora: "17:00", nome: "Partenza per Changsha", note: "AV ~5h.", tipo: "logistica" },
            ]
          }
        ]
      },
      {
        id: 104,
        nome: "Changsha",
        paese: "Cina",
        lat: 28.1987,
        lng: 112.9724,
        ordine: 4,
        data_arrivo: "2026-08-28",
        data_partenza: "2026-08-29",
        notti: 1,
        hotel: { nome: "", indirizzo: "", link: "" },
        stazione: { nome: "Changsha South Station", note: "Arrivo sera 28 · partenza mattina 29" },
        trasporto_arrivo: "AV Xi'an → Changsha · ~5h · sera 28 agosto",
        trasporto_partenza: "AV Changsha South → Zhangjiajie West · ~2h · mattina 29 agosto",
        giorni: [
          {
            numero: 1,
            titolo: "Tappa di transito",
            data: "2026-08-28",
            attivita: [
              { ora: "22:00", nome: "Arrivo da Xi'an", note: "Check-in hotel vicino alla stazione.", tipo: "logistica" },
              { ora: "22:30", nome: "Taiping Road Street Food", note: "Cucina Hunan piccantissima. Tang hulu, smelly tofu fritto.", tipo: "cibo" },
              { ora: "08:00", nome: "Museo Provinciale Hunan (facoltativo)", note: "La mummia di Lady Dai (200 a.C.). ~1h30.", tipo: "attrazione" },
              { ora: "10:00", nome: "Monte Yuelu", note: "Accademia millenaria. ~1h.", tipo: "attrazione" },
              { ora: "12:00", nome: "Pranzo + partenza", note: "AV Changsha South → Zhangjiajie West. ~2h.", tipo: "logistica" },
            ]
          }
        ]
      },
      {
        id: 105,
        nome: "Zhangjiajie",
        paese: "Cina",
        lat: 29.1256,
        lng: 110.4785,
        ordine: 5,
        data_arrivo: "2026-08-29",
        data_partenza: "2026-08-31",
        notti: 2,
        hotel: { nome: "Thousand Hotel", indirizzo: "", link: "" },
        stazione: { nome: "Zhangjiajie West", note: "" },
        trasporto_arrivo: "AV Changsha → Zhangjiajie West · ~2h · 29 agosto",
        trasporto_partenza: "AV Zhangjiajie → Fenghuanggucheng · poi taxi 10 km · 31 agosto",
        giorni: [
          {
            numero: 1,
            titolo: "Tianmen Mountain",
            data: "2026-08-29",
            attivita: [
              { ora: "Pomeriggio", nome: "Arrivo da Changsha", note: "AV ~2h. Check-in Thousand Hotel.", tipo: "logistica" },
              { ora: "15:00", nome: "Funivia Tianmen Mountain", note: "7.455m, 30 min. ~258 yuan.", tipo: "attrazione", avviso: "Code 2h+ — arrivare 30 min prima apertura" },
              { ora: "16:30", nome: "Porta del Paradiso + passerelle vetro", tipo: "attrazione" },
              { ora: "18:00", nome: "Discesa · cena", tipo: "cibo" },
            ]
          },
          {
            numero: 2,
            titolo: "Avatar Mountains · Wulingyuan",
            data: "2026-08-30",
            attivita: [
              { ora: "06:30", nome: "Ingresso parco Wulingyuan", tipo: "logistica", avviso: "Biglietto 248 yuan/4gg · Trip.com con passaporto" },
              { ora: "07:00", nome: "Ascensore Bailong", note: "335m in 88 sec.", tipo: "attrazione" },
              { ora: "08:00", nome: "Yuanjiajie · Avatar Mountain", note: "Southern Sky Column.", tipo: "attrazione" },
              { ora: "11:00", nome: "Monte Tianzi", note: "Bus navetta gratuito.", tipo: "attrazione" },
              { ora: "14:30", nome: "Golden Whip Stream", note: "7.5 km. Scimmie selvatiche.", tipo: "attrazione" },
              { ora: "17:00", nome: "Uscita · cena", tipo: "cibo" },
            ]
          },
          {
            numero: 3,
            titolo: "Partenza per Fenghuang",
            data: "2026-08-31",
            attivita: [
              { ora: "Mattina", nome: "Treno per Fenghuanggucheng", note: "AV ~1h. Poi taxi 10 km / ~25 yuan.", tipo: "logistica" },
            ]
          }
        ]
      },
      {
        id: 106,
        nome: "Fenghuang",
        paese: "Cina",
        lat: 27.9505,
        lng: 109.5989,
        ordine: 6,
        data_arrivo: "2026-08-31",
        data_partenza: "2026-09-01",
        notti: 1,
        hotel: { nome: "Anzhidinglan B&B", indirizzo: "Sul fiume Tuojiang", note: "Pickup dalla stazione incluso." },
        stazione: { nome: "Fenghuanggucheng", note: "~10 km dalla città antica" },
        trasporto_arrivo: "AV Zhangjiajie → Fenghuanggucheng ~1h · 31 agosto",
        trasporto_partenza: "Treno Fenghuanggucheng → Guilin · ~3-4h · 1 settembre",
        giorni: [
          {
            numero: 1,
            titolo: "Città della fenice",
            data: "2026-08-31",
            attivita: [
              { ora: "12:00", nome: "Arrivo da Zhangjiajie", note: "AV ~1h, poi taxi ~25 yuan.", tipo: "logistica" },
              { ora: "13:00", nome: "Check-in Anzhidinglan B&B", note: "Sul fiume Tuojiang. Pickup incluso.", tipo: "logistica" },
              { ora: "14:00", nome: "Ponte Arcobaleno + Diaojiaolou", tipo: "attrazione" },
              { ora: "16:30", nome: "Barca sul Tuojiang", note: "~30-40 yuan.", tipo: "attrazione" },
              { ora: "18:30", nome: "Cena con sapori Miao", note: "Anatra al sangue, pesce piccante.", tipo: "cibo" },
              { ora: "19:30", nome: "Crociera serale illuminata", tipo: "attrazione" },
              { ora: "20:30", nome: "Falò Miao (facoltativo)", note: "50–80 yuan.", tipo: "attrazione" },
            ]
          },
          {
            numero: 2,
            titolo: "Alba e partenza",
            data: "2026-09-01",
            attivita: [
              { ora: "07:00", nome: "Passeggiata all'alba", note: "Silenziosa e autentica.", tipo: "attrazione" },
              { ora: "10:00", nome: "Taxi per la stazione", note: "Navetta Anzhidinglan inclusa.", tipo: "logistica" },
            ]
          }
        ]
      },
      {
        id: 107,
        nome: "Guilin",
        paese: "Cina",
        lat: 25.2786,
        lng: 110.2950,
        ordine: 7,
        data_arrivo: "2026-09-01",
        data_partenza: "2026-09-03",
        notti: 2,
        hotel: { nome: "", indirizzo: "", link: "" },
        stazione: { nome: "Guilin", note: "" },
        trasporto_arrivo: "Treno Fenghuanggucheng → Guilin · ~3-4h · 1 settembre",
        trasporto_partenza: "Crociera Li River → Yangshuo · 3 settembre · poi → Hong Kong · 4 settembre",
        giorni: [
          {
            numero: 1,
            titolo: "Arrivo e serata sul lago",
            data: "2026-09-01",
            attivita: [
              { ora: "15:00", nome: "Arrivo da Fenghuang", tipo: "logistica" },
              { ora: "17:30", nome: "Pagode del Sole e della Luna", note: "Al tramonto sul Lago Shanhu.", tipo: "attrazione" },
              { ora: "19:00", nome: "Zhengyang Road", note: "Ponti illuminati, cibo di strada.", tipo: "cibo" },
            ]
          },
          {
            numero: 2,
            titolo: "Gita a Longji + Reed Flute Cave",
            data: "2026-09-02",
            attivita: [
              { ora: "07:30", nome: "Partenza auto privata per Longji", note: "~1h30. Biglietto 80 yuan.", tipo: "logistica", avviso: "Prenotare auto dall'hotel la sera prima" },
              { ora: "09:00", nome: "Jinkeng/Dazhai · Punti panoramici", note: "Terrazze verde brillante. ~3h di cammino.", tipo: "attrazione" },
              { ora: "13:00", nome: "Pranzo al villaggio", note: "Riso glutinoso in canna di bambù, vino di riso Yao.", tipo: "cibo" },
              { ora: "14:30", nome: "Rientro a Guilin", note: "~1h30. Arrivo ~16:00.", tipo: "logistica" },
              { ora: "16:30", nome: "Reed Flute Cave", note: "Grotta 180m con stalattiti illuminate. ~1h.", tipo: "attrazione" },
              { ora: "19:00", nome: "Cena · preparativi crociera", tipo: "cibo", avviso: "Crociera Li River: prenotare WeChat 'Lijiang Ticketing Office'" },
            ]
          },
          {
            numero: 3,
            titolo: "Crociera Li River → Yangshuo",
            data: "2026-09-03",
            attivita: [
              { ora: "08:00", nome: "Transfer al molo Zhujiang", note: "~30 min da Guilin centro.", tipo: "logistica" },
              { ora: "09:30", nome: "Crociera Li River", note: "4h30. Karst, villaggi, bufali, pescatori con cormorani.", tipo: "attrazione" },
              { ora: "14:00", nome: "Arrivo a Yangshuo", note: "Molo Longtoushan. Taxi per hotel.", tipo: "logistica" },
            ]
          }
        ]
      },
      {
        id: 108,
        nome: "Yangshuo",
        paese: "Cina",
        lat: 24.7770,
        lng: 110.4953,
        ordine: 8,
        data_arrivo: "2026-09-03",
        data_partenza: "2026-09-04",
        notti: 1,
        hotel: { nome: "", indirizzo: "", link: "" },
        stazione: { nome: "", note: "" },
        trasporto_arrivo: "Crociera Li River → Yangshuo · 3 settembre",
        trasporto_partenza: "Yangshuo → Guilin → Guangzhou AV (~2h30) → MTR Hong Kong (~50 min) · 4 settembre",
        giorni: [
          {
            numero: 1,
            titolo: "Arrivo dalla crociera",
            data: "2026-09-03",
            attivita: [
              { ora: "14:00", nome: "Sbarco a Yangshuo", note: "Molo Longtoushan. Taxi per hotel.", tipo: "logistica" },
              { ora: "15:30", nome: "West Street", note: "Architettura Ming-Qing, caffè, artigianato.", tipo: "attrazione" },
              { ora: "17:00", nome: "Bici tra le colline carsiche", tipo: "attrazione" },
              { ora: "20:00", nome: "Impression Sanjie Liu", note: "~200 yuan.", tipo: "attrazione", avviso: "Prenotare in anticipo" },
            ]
          },
          {
            numero: 2,
            titolo: "Mattina e partenza per Hong Kong",
            data: "2026-09-04",
            attivita: [
              { ora: "07:30", nome: "Fiume Yulong in zattera", note: "~80 yuan, 1h.", tipo: "attrazione" },
              { ora: "09:30", nome: "Check-out e partenza", tipo: "logistica" },
              { ora: "10:30", nome: "Bus Yangshuo → Guilin", note: "~1h. Poi AV Guangzhou (~2h30).", tipo: "logistica" },
              { ora: "15:00", nome: "MTR → Hong Kong", note: "~50 min. Arrivo West Kowloon.", tipo: "logistica" },
            ]
          }
        ]
      },
      {
        id: 109,
        nome: "Hong Kong",
        paese: "Hong Kong",
        lat: 22.2978,
        lng: 114.1722,
        ordine: 9,
        data_arrivo: "2026-09-04",
        data_partenza: "2026-09-07",
        notti: 3,
        hotel: { nome: "", indirizzo: "Tsim Sha Tsui, Kowloon", link: "" },
        stazione: { nome: "West Kowloon", note: "Arrivo MTR da Guangzhou" },
        note: "Nessun visto per italiani · 90 giorni",
        trasporto_arrivo: "MTR Cross-Boundary Guangzhou → West Kowloon · ~50 min · 4 settembre",
        trasporto_partenza: "Volo VN0593 HKG → HAN 14:30 · scalo 9h15 · VN0073 00:50 → MXP · PNR XLGNLT",
        giorni: [
          {
            numero: 1,
            titolo: "Arrivo e Kowloon",
            data: "2026-09-04",
            attivita: [
              { ora: "16:00", nome: "Arrivo West Kowloon", note: "Da Guangzhou via MTR.", tipo: "logistica" },
              { ora: "17:30", nome: "Check-in hotel Kowloon", note: "Tsim Sha Tsui.", tipo: "logistica" },
              { ora: "19:00", nome: "Temple Street Night Market", note: "Cibo di strada, cartomanti, souvenir.", tipo: "cibo" },
              { ora: "21:00", nome: "Skyline Avenue of Stars", note: "Il panorama notturno più bello di HK.", tipo: "attrazione" },
            ]
          },
          {
            numero: 2,
            titolo: "Victoria Peak e isola",
            data: "2026-09-05",
            attivita: [
              { ora: "08:00", nome: "Dim sum del mattino", note: "Ristoranti locali a Sham Shui Po.", tipo: "cibo" },
              { ora: "09:30", nome: "Star Ferry → HK Island", note: "3.5 HKD, 10 min.", tipo: "attrazione" },
              { ora: "10:00", nome: "Peak Tram → Victoria Peak", tipo: "attrazione", avviso: "Code fino a 1h — biglietti online" },
              { ora: "11:30", nome: "Central e SoHo", note: "Hollywood Road. Escalator coperta.", tipo: "attrazione" },
              { ora: "15:00", nome: "Mong Kok", note: "Ladies Market e Flower Market.", tipo: "attrazione" },
              { ora: "19:00", nome: "Cena cantonese", note: "Rooftop bar con skyline.", tipo: "cibo" },
            ]
          },
          {
            numero: 3,
            titolo: "Lantau Island",
            data: "2026-09-06",
            attivita: [
              { ora: "09:00", nome: "MTR → Tung Chung · Cable car Ngong Ping", note: "25 min di funivia panoramica.", tipo: "logistica", avviso: "Prenotare online in anticipo" },
              { ora: "10:30", nome: "Tian Tan Big Buddha", note: "34m. 268 scalini. Vista sull'oceano.", tipo: "attrazione" },
              { ora: "12:30", nome: "Pranzo vegetariano monastero Po Lin", tipo: "cibo" },
              { ora: "14:30", nome: "Villaggio Tai O", note: "Il 'Venezia di Hong Kong'. Delfini rosa.", tipo: "attrazione" },
              { ora: "17:30", nome: "Rientro a Kowloon", note: "Ultima sera a Hong Kong.", tipo: "logistica" },
            ]
          },
          {
            numero: 4,
            titolo: "Mattina libera e partenza",
            data: "2026-09-07",
            attivita: [
              { ora: "08:00", nome: "Ultima colazione", note: "Dim sum o cha chaan teng locale.", tipo: "cibo" },
              { ora: "10:00", nome: "Passeggiata o shopping finale" },
              { ora: "12:30", nome: "Airport Express da Hong Kong Station", note: "~24 min.", tipo: "logistica", avviso: "IN AEROPORTO ENTRO LE 12:30 — volo VN0593 parte alle 14:30" },
            ]
          }
        ]
      }
    ]
  }
]

export default viaggi