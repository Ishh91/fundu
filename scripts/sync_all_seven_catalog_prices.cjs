const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const allBrandPrices = [
  // ===================== 1. SAMSUNG =====================
  { brand: 'Samsung', name: 'Galaxy S24 Ultra 5G', variant: '512 GB', price: 65500 },
  { brand: 'Samsung', name: 'Galaxy S24 Ultra 5G', variant: '256 GB', price: 64500 },
  { brand: 'Samsung', name: 'Galaxy S24 Plus 5G', variant: '256 GB', price: 50000 },
  { brand: 'Samsung', name: 'Galaxy S24 5G', variant: '256 GB', price: 43000 },
  { brand: 'Samsung', name: 'Galaxy S24 5G', variant: '128 GB', price: 39500 },
  { brand: 'Samsung', name: 'Galaxy S23 Ultra 5G', variant: '512 GB', price: 48000 },
  { brand: 'Samsung', name: 'Galaxy S23 Ultra 5G', variant: '256 GB', price: 48000 },
  { brand: 'Samsung', name: 'Galaxy S23 Plus 5G', variant: '256 GB', price: 35000 },
  { brand: 'Samsung', name: 'Galaxy S23 5G', variant: '256 GB', price: 28000 },
  { brand: 'Samsung', name: 'Galaxy S23 5G', variant: '128 GB', price: 28000 },
  { brand: 'Samsung', name: 'Galaxy S23 FE 5G', variant: '128 GB', price: 21500 },
  { brand: 'Samsung', name: 'Galaxy S22 Ultra 5G', variant: '256 GB', price: 32000 },
  { brand: 'Samsung', name: 'Galaxy S22 Plus 5G', variant: '128 GB', price: 26000 },
  { brand: 'Samsung', name: 'Galaxy S22 5G', variant: '128 GB', price: 21500 },
  { brand: 'Samsung', name: 'Galaxy S21 Ultra 5G', variant: '256 GB', price: 25500 },
  { brand: 'Samsung', name: 'Galaxy S21 Plus 5G', variant: '128 GB', price: 19500 },
  { brand: 'Samsung', name: 'Galaxy S21 5G', variant: '128 GB', price: 16000 },
  { brand: 'Samsung', name: 'Galaxy S21 FE 5G', variant: '128 GB', price: 14000 },
  { brand: 'Samsung', name: 'Galaxy S20 Ultra', variant: '128 GB', price: 18000 },
  { brand: 'Samsung', name: 'Galaxy S20 Plus', variant: '128 GB', price: 13500 },
  { brand: 'Samsung', name: 'Galaxy S20', variant: '128 GB', price: 11000 },
  { brand: 'Samsung', name: 'Galaxy S20 FE 5G', variant: '128 GB', price: 11000 },
  { brand: 'Samsung', name: 'Galaxy S10 Plus', variant: '128 GB', price: 10000 },
  { brand: 'Samsung', name: 'Galaxy S10', variant: '128 GB', price: 7500 },
  { brand: 'Samsung', name: 'Galaxy S10e', variant: '128 GB', price: 6000 },
  { brand: 'Samsung', name: 'Galaxy S10 Lite', variant: '128 GB', price: 6500 },
  { brand: 'Samsung', name: 'Galaxy S9 Plus', variant: '64 GB', price: 4800 },
  { brand: 'Samsung', name: 'Galaxy S9', variant: '64 GB', price: 3500 },
  { brand: 'Samsung', name: 'Galaxy Z Fold 6 5G', variant: '256 GB', price: 76000 },
  { brand: 'Samsung', name: 'Galaxy Z Fold 5 5G', variant: '512 GB', price: 55000 },
  { brand: 'Samsung', name: 'Galaxy Z Fold 5 5G', variant: '256 GB', price: 55000 },
  { brand: 'Samsung', name: 'Galaxy Z Fold 4 5G', variant: '256 GB', price: 42000 },
  { brand: 'Samsung', name: 'Galaxy Note 20 Ultra 5G', variant: '256 GB', price: 23000 },
  { brand: 'Samsung', name: 'Galaxy Note 20', variant: '256 GB', price: 14000 },
  { brand: 'Samsung', name: 'Galaxy Note 10 Plus', variant: '256 GB', price: 13000 },
  { brand: 'Samsung', name: 'Galaxy Note 10', variant: '256 GB', price: 9800 },
  { brand: 'Samsung', name: 'Galaxy Note 10 Lite', variant: '128 GB', price: 7500 },
  { brand: 'Samsung', name: 'Galaxy Note 9', variant: '128 GB', price: 6500 },
  { brand: 'Samsung', name: 'Galaxy Note 8', variant: '64 GB', price: 5000 },
  { brand: 'Samsung', name: 'Galaxy Note Fan Edition', variant: '64 GB', price: 4200 },
  { brand: 'Samsung', name: 'Galaxy A55 5G', variant: '128 GB', price: 18500 },
  { brand: 'Samsung', name: 'Galaxy A54 5G', variant: '128 GB', price: 15000 },
  { brand: 'Samsung', name: 'Galaxy A53 5G', variant: '128 GB', price: 12000 },
  { brand: 'Samsung', name: 'Galaxy A52s 5G', variant: '128 GB', price: 9200 },
  { brand: 'Samsung', name: 'Galaxy A52', variant: '128 GB', price: 7500 },
  { brand: 'Samsung', name: 'Galaxy A51', variant: '128 GB', price: 5400 },
  { brand: 'Samsung', name: 'Galaxy A50s', variant: '128 GB', price: 5000 },
  { brand: 'Samsung', name: 'Galaxy A50', variant: '64 GB', price: 3600 },
  { brand: 'Samsung', name: 'Galaxy A73 5G', variant: '128 GB', price: 13500 },
  { brand: 'Samsung', name: 'Galaxy A72', variant: '128 GB', price: 8500 },
  { brand: 'Samsung', name: 'Galaxy A71', variant: '128 GB', price: 7000 },
  { brand: 'Samsung', name: 'Galaxy A70s', variant: '128 GB', price: 5200 },
  { brand: 'Samsung', name: 'Galaxy A70', variant: '128 GB', price: 4700 },
  { brand: 'Samsung', name: 'Galaxy A80', variant: '128 GB', price: 6100 },
  { brand: 'Samsung', name: 'Galaxy A90 5G', variant: '128 GB', price: 7200 },
  { brand: 'Samsung', name: 'Galaxy A9 (2018)', variant: '128 GB', price: 3900 },
  { brand: 'Samsung', name: 'Galaxy A35 5G', variant: '128 GB', price: 14500 },
  { brand: 'Samsung', name: 'Galaxy A34 5G', variant: '128 GB', price: 11000 },
  { brand: 'Samsung', name: 'Galaxy A33 5G', variant: '128 GB', price: 8500 },
  { brand: 'Samsung', name: 'Galaxy A32', variant: '128 GB', price: 5600 },
  { brand: 'Samsung', name: 'Galaxy A31', variant: '128 GB', price: 4500 },
  { brand: 'Samsung', name: 'Galaxy A30s', variant: '64 GB', price: 3800 },
  { brand: 'Samsung', name: 'Galaxy A30', variant: '64 GB', price: 2900 },
  { brand: 'Samsung', name: 'Galaxy A8 Plus (2018)', variant: '64 GB', price: 2600 },
  { brand: 'Samsung', name: 'Galaxy A25 5G', variant: '128 GB', price: 10500 },
  { brand: 'Samsung', name: 'Galaxy A24', variant: '128 GB', price: 6500 },
  { brand: 'Samsung', name: 'Galaxy A23 5G', variant: '128 GB', price: 7500 },
  { brand: 'Samsung', name: 'Galaxy A23', variant: '128 GB', price: 5800 },
  { brand: 'Samsung', name: 'Galaxy A22 5G', variant: '128 GB', price: 4900 },
  { brand: 'Samsung', name: 'Galaxy M55 5G', variant: '128 GB', price: 13500 },
  { brand: 'Samsung', name: 'Galaxy M54 5G', variant: '128 GB', price: 10500 },
  { brand: 'Samsung', name: 'Galaxy M53 5G', variant: '128 GB', price: 10500 },
  { brand: 'Samsung', name: 'Galaxy M52 5G', variant: '128 GB', price: 7500 },
  { brand: 'Samsung', name: 'Galaxy M51', variant: '128 GB', price: 7000 },
  { brand: 'Samsung', name: 'Galaxy M42 5G', variant: '128 GB', price: 6800 },
  { brand: 'Samsung', name: 'Galaxy M40', variant: '128 GB', price: 3600 },
  { brand: 'Samsung', name: 'Galaxy M35 5G', variant: '128 GB', price: 11000 },
  { brand: 'Samsung', name: 'Galaxy M34 5G', variant: '128 GB', price: 8500 },
  { brand: 'Samsung', name: 'Galaxy M33 5G', variant: '128 GB', price: 7200 },
  { brand: 'Samsung', name: 'Galaxy M32 5G', variant: '128 GB', price: 5800 },
  { brand: 'Samsung', name: 'Galaxy M32', variant: '64 GB', price: 4200 },
  { brand: 'Samsung', name: 'Galaxy M31s', variant: '128 GB', price: 5800 },
  { brand: 'Samsung', name: 'Galaxy M31', variant: '64 GB', price: 5000 },
  { brand: 'Samsung', name: 'Galaxy M30s', variant: '64 GB', price: 3800 },
  { brand: 'Samsung', name: 'Galaxy M21s', variant: '64 GB', price: 4200 },
  { brand: 'Samsung', name: 'Galaxy M21', variant: '64 GB', price: 3500 },
  { brand: 'Samsung', name: 'Galaxy M15 5G', variant: '128 GB', price: 6500 },
  { brand: 'Samsung', name: 'Galaxy M14 5G', variant: '128 GB', price: 6500 },
  { brand: 'Samsung', name: 'Galaxy M13 5G', variant: '64 GB', price: 4500 },
  { brand: 'Samsung', name: 'Galaxy M13', variant: '64 GB', price: 3200 },
  { brand: 'Samsung', name: 'Galaxy M12', variant: '64 GB', price: 3000 },
  { brand: 'Samsung', name: 'Galaxy M04', variant: '64 GB', price: 2800 },
  { brand: 'Samsung', name: 'Galaxy F55 5G', variant: '128 GB', price: 16000 },
  { brand: 'Samsung', name: 'Galaxy F54 5G', variant: '256 GB', price: 12000 },
  { brand: 'Samsung', name: 'Galaxy F62', variant: '128 GB', price: 7200 },
  { brand: 'Samsung', name: 'Galaxy F42 5G', variant: '128 GB', price: 5500 },
  { brand: 'Samsung', name: 'Galaxy F41', variant: '64 GB', price: 3800 },
  { brand: 'Samsung', name: 'Galaxy F34 5G', variant: '128 GB', price: 8500 },
  { brand: 'Samsung', name: 'Galaxy F23 5G', variant: '128 GB', price: 6000 },
  { brand: 'Samsung', name: 'Galaxy F22', variant: '64 GB', price: 4800 },
  { brand: 'Samsung', name: 'Galaxy F15 5G', variant: '128 GB', price: 6500 },
  { brand: 'Samsung', name: 'Galaxy F14 5G', variant: '128 GB', price: 6500 },
  { brand: 'Samsung', name: 'Galaxy F13', variant: '64 GB', price: 4000 },
  { brand: 'Samsung', name: 'Galaxy F12', variant: '64 GB', price: 3000 },
  { brand: 'Samsung', name: 'Galaxy F04', variant: '64 GB', price: 2800 },

  // ===================== 2. MOTOROLA =====================
  { brand: 'Motorola', name: 'Razr 50 Ultra 5G', variant: '512 GB', price: 39800 },
  { brand: 'Motorola', name: 'Razr 50 5G', variant: '256 GB', price: 29500 },
  { brand: 'Motorola', name: 'Razr 40 Ultra 5G', variant: '256 GB', price: 24500 },
  { brand: 'Motorola', name: 'Razr 40 5G', variant: '256 GB', price: 18200 },
  { brand: 'Motorola', name: 'Razr 5G', variant: '256 GB', price: 14900 },
  { brand: 'Motorola', name: 'Razr (2019)', variant: '128 GB', price: 11400 },
  { brand: 'Motorola', name: 'Moto Edge Plus', variant: '256 GB', price: 14200 },
  { brand: 'Motorola', name: 'Moto Edge 50 Ultra 5G', variant: '512 GB', price: 28640 },
  { brand: 'Motorola', name: 'Moto Edge 50 Pro 5G', variant: '256 GB', price: 18900 },
  { brand: 'Motorola', name: 'Moto Edge 50 Fusion 5G', variant: '128 GB', price: 15500 },
  { brand: 'Motorola', name: 'Moto Edge 50 Fusion 5G', variant: '256 GB', price: 16800 },
  { brand: 'Motorola', name: 'Moto Edge 50 Neo 5G', variant: '256 GB', price: 14900 },
  { brand: 'Motorola', name: 'Moto Edge 40 5G', variant: '256 GB', price: 13200 },
  { brand: 'Motorola', name: 'Moto Edge 40 Neo 5G', variant: '128 GB', price: 11600 },
  { brand: 'Motorola', name: 'Moto Edge 30 Ultra 5G', variant: '128 GB', price: 15800 },
  { brand: 'Motorola', name: 'Moto Edge 30 Pro 5G', variant: '128 GB', price: 12450 },
  { brand: 'Motorola', name: 'Moto Edge 30 Fusion 5G', variant: '128 GB', price: 11800 },
  { brand: 'Motorola', name: 'Moto Edge 30 5G', variant: '128 GB', price: 9600 },
  { brand: 'Motorola', name: 'Moto Edge 20 Pro 5G', variant: '128 GB', price: 9800 },
  { brand: 'Motorola', name: 'Moto Edge 20 5G', variant: '128 GB', price: 8400 },
  { brand: 'Motorola', name: 'Moto Edge 20 Fusion 5G', variant: '128 GB', price: 7900 },
  { brand: 'Motorola', name: 'Moto G85 5G', variant: '128 GB', price: 14210 },
  { brand: 'Motorola', name: 'Moto G85 5G', variant: '256 GB', price: 15600 },
  { brand: 'Motorola', name: 'Moto G84 5G', variant: '256 GB', price: 11800 },
  { brand: 'Motorola', name: 'Moto G82 5G', variant: '128 GB', price: 9200 },
  { brand: 'Motorola', name: 'Moto G73 5G', variant: '128 GB', price: 8150 },
  { brand: 'Motorola', name: 'Moto G72', variant: '128 GB', price: 7800 },
  { brand: 'Motorola', name: 'Moto G71 5G', variant: '128 GB', price: 7400 },
  { brand: 'Motorola', name: 'Moto G64 5G', variant: '128 GB', price: 10340 },
  { brand: 'Motorola', name: 'Moto G64 5G', variant: '256 GB', price: 11500 },
  { brand: 'Motorola', name: 'Moto G62 5G', variant: '128 GB', price: 7200 },
  { brand: 'Motorola', name: 'Moto G60', variant: '128 GB', price: 6120 },
  { brand: 'Motorola', name: 'Moto G54 5G', variant: '128 GB', price: 8820 },
  { brand: 'Motorola', name: 'Moto G54 5G', variant: '256 GB', price: 9700 },
  { brand: 'Motorola', name: 'Moto G52', variant: '64 GB', price: 6400 },
  { brand: 'Motorola', name: 'Moto G52', variant: '128 GB', price: 7100 },
  { brand: 'Motorola', name: 'Moto G51 5G', variant: '64 GB', price: 5900 },
  { brand: 'Motorola', name: 'Moto G45 5G', variant: '128 GB', price: 7600 },
  { brand: 'Motorola', name: 'Moto G42', variant: '64 GB', price: 5500 },
  { brand: 'Motorola', name: 'Moto G40 Fusion', variant: '64 GB', price: 5400 },
  { brand: 'Motorola', name: 'Moto G40 Fusion', variant: '128 GB', price: 6200 },
  { brand: 'Motorola', name: 'Moto G34 5G', variant: '128 GB', price: 7200 },
  { brand: 'Motorola', name: 'Moto G32', variant: '64 GB', price: 5200 },
  { brand: 'Motorola', name: 'Moto G32', variant: '128 GB', price: 6100 },
  { brand: 'Motorola', name: 'Moto G31', variant: '64 GB', price: 4900 },
  { brand: 'Motorola', name: 'Moto G24 Power', variant: '128 GB', price: 5800 },
  { brand: 'Motorola', name: 'Moto G22', variant: '64 GB', price: 4800 },
  { brand: 'Motorola', name: 'Moto G30', variant: '64 GB', price: 4600 },
  { brand: 'Motorola', name: 'Moto G10 Power', variant: '64 GB', price: 4400 },
  { brand: 'Motorola', name: 'Moto G9 Power', variant: '64 GB', price: 4500 },
  { brand: 'Motorola', name: 'Moto G9', variant: '64 GB', price: 4100 },
  { brand: 'Motorola', name: 'Moto G 5G', variant: '128 GB', price: 5900 },
  { brand: 'Motorola', name: 'Moto G8 Power Lite', variant: '64 GB', price: 3400 },
  { brand: 'Motorola', name: 'Moto G7 Plus', variant: '64 GB', price: 2400 },
  { brand: 'Motorola', name: 'One Fusion Plus', variant: '128 GB', price: 4890 },
  { brand: 'Motorola', name: 'One Action', variant: '128 GB', price: 3600 },
  { brand: 'Motorola', name: 'One Vision', variant: '128 GB', price: 3700 },
  { brand: 'Motorola', name: 'One Hyper', variant: '128 GB', price: 4100 },
  { brand: 'Motorola', name: 'One Power', variant: '64 GB', price: 2800 },
  { brand: 'Motorola', name: 'Moto Z2 Force', variant: '64 GB', price: 2900 },
  { brand: 'Motorola', name: 'Moto Z Play', variant: '64 GB', price: 2200 },
  { brand: 'Motorola', name: 'Moto E40', variant: '64 GB', price: 4200 },
  { brand: 'Motorola', name: 'Moto E32', variant: '64 GB', price: 3900 },
  { brand: 'Motorola', name: 'Moto E32s', variant: '64 GB', price: 3700 },
  { brand: 'Motorola', name: 'Moto E7 Plus', variant: '64 GB', price: 3400 },
  { brand: 'Motorola', name: 'Moto E6s', variant: '64 GB', price: 2600 },
  { brand: 'Motorola', name: 'Moto M', variant: '64 GB', price: 2200 },

  // ===================== 4. INFINIX =====================
  { brand: 'Infinix', name: 'Zero 30 5G', variant: '256 GB', price: 11400 },
  { brand: 'Infinix', name: 'GT 20 Pro 5G', variant: '256 GB', price: 11200 },
  { brand: 'Infinix', name: 'Note 40 Pro+ 5G', variant: '256 GB', price: 10500 },
  { brand: 'Infinix', name: 'Note 40 Pro 5G', variant: '256 GB', price: 8900 },
  { brand: 'Infinix', name: 'GT 10 Pro 5G', variant: '256 GB', price: 8600 },
  { brand: 'Infinix', name: 'Note 30 5G', variant: '256 GB', price: 6400 },
  { brand: 'Infinix', name: 'Hot 30 5G', variant: '128 GB', price: 5100 },

  // ===================== 5. GOOGLE PIXEL =====================
  { brand: 'Google', name: 'Pixel 9 Pro Fold', variant: '512 GB', price: 72500 },
  { brand: 'Google', name: 'Pixel 9 Pro Fold', variant: '256 GB', price: 66000 },
  { brand: 'Google', name: 'Pixel Fold', variant: '256 GB', price: 42000 },
  { brand: 'Google', name: 'Pixel 9 Pro XL', variant: '512 GB', price: 68500 },
  { brand: 'Google', name: 'Pixel 9 Pro XL', variant: '256 GB', price: 64500 },
  { brand: 'Google', name: 'Pixel 9 Pro', variant: '128 GB', price: 52800 },
  { brand: 'Google', name: 'Pixel 9', variant: '256 GB', price: 37440 },
  { brand: 'Google', name: 'Pixel 9', variant: '128 GB', price: 34500 },
  { brand: 'Google', name: 'Pixel 8 Pro', variant: '256 GB', price: 32880 },
  { brand: 'Google', name: 'Pixel 8 Pro', variant: '128 GB', price: 32260 },
  { brand: 'Google', name: 'Pixel 8', variant: '256 GB', price: 18500 },
  { brand: 'Google', name: 'Pixel 8', variant: '128 GB', price: 16800 },
  { brand: 'Google', name: 'Pixel 8a', variant: '256 GB', price: 15800 },
  { brand: 'Google', name: 'Pixel 8a', variant: '128 GB', price: 14200 },
  { brand: 'Google', name: 'Pixel 7 Pro', variant: '256 GB', price: 19800 },
  { brand: 'Google', name: 'Pixel 7 Pro', variant: '128 GB', price: 18670 },
  { brand: 'Google', name: 'Pixel 7', variant: '256 GB', price: 15400 },
  { brand: 'Google', name: 'Pixel 7', variant: '128 GB', price: 14620 },
  { brand: 'Google', name: 'Pixel 7a', variant: '128 GB', price: 11850 },
  { brand: 'Google', name: 'Pixel 6 Pro', variant: '128 GB', price: 11500 },
  { brand: 'Google', name: 'Pixel 6', variant: '256 GB', price: 11400 },
  { brand: 'Google', name: 'Pixel 6', variant: '128 GB', price: 10200 },
  { brand: 'Google', name: 'Pixel 6a', variant: '128 GB', price: 9810 },
  { brand: 'Google', name: 'Pixel 5', variant: '128 GB', price: 6400 },
  { brand: 'Google', name: 'Pixel 4a', variant: '128 GB', price: 4240 },
  { brand: 'Google', name: 'Pixel 4 XL', variant: '64 GB', price: 3100 },
  { brand: 'Google', name: 'Pixel 4', variant: '64 GB', price: 3100 },
  { brand: 'Google', name: 'Pixel 3a XL', variant: '64 GB', price: 2150 },
  { brand: 'Google', name: 'Pixel 3a', variant: '64 GB', price: 1850 },
  { brand: 'Google', name: 'Pixel 3 XL', variant: '64 GB', price: 1950 },

  // ===================== 7. HONOR =====================
  { brand: 'Honor', name: 'Magic 6 Pro 5G', variant: '512 GB', price: 36000 },
  { brand: 'Honor', name: 'Magic 5 Pro 5G', variant: '512 GB', price: 24800 },
  { brand: 'Honor', name: 'Magic 4 Pro 5G', variant: '256 GB', price: 16500 },
  { brand: 'Honor', name: '200 Pro 5G', variant: '512 GB', price: 20890 },
  { brand: 'Honor', name: '200 5G', variant: '512 GB', price: 13400 },
  { brand: 'Honor', name: '200 5G', variant: '256 GB', price: 11980 },
  { brand: 'Honor', name: '200 Lite 5G', variant: '256 GB', price: 9450 },
  { brand: 'Honor', name: '200 Smart 5G', variant: '128 GB', price: 7200 },
  { brand: 'Honor', name: '90 5G', variant: '512 GB', price: 12270 },
  { brand: 'Honor', name: '90 5G', variant: '256 GB', price: 10850 },
  { brand: 'Honor', name: 'X9b 5G', variant: '256 GB', price: 10500 },
  { brand: 'Honor', name: 'X8b', variant: '128 GB', price: 7800 },
  { brand: 'Honor', name: 'X7b', variant: '128 GB', price: 7800 },
  { brand: 'Honor', name: '20 Pro', variant: '256 GB', price: 5800 },
  { brand: 'Honor', name: '20', variant: '128 GB', price: 4450 },
  { brand: 'Honor', name: '20i', variant: '128 GB', price: 2850 },
  { brand: 'Honor', name: 'Play', variant: '64 GB', price: 2690 },
  { brand: 'Honor', name: 'Play 30', variant: '128 GB', price: 3400 },
  { brand: 'Honor', name: 'Play 40 5G', variant: '128 GB', price: 3400 },
  { brand: 'Honor', name: '10', variant: '128 GB', price: 3120 },
  { brand: 'Honor', name: '10 Lite', variant: '64 GB', price: 2380 },
  { brand: 'Honor', name: '9X Pro', variant: '256 GB', price: 3400 },
  { brand: 'Honor', name: '9X', variant: '128 GB', price: 2650 },
  { brand: 'Honor', name: '9N', variant: '64 GB', price: 1850 },
  { brand: 'Honor', name: '9 Lite', variant: '64 GB', price: 1720 },
  { brand: 'Honor', name: '8X', variant: '128 GB', price: 2780 },
  { brand: 'Honor', name: '8X', variant: '64 GB', price: 2240 },
  { brand: 'Honor', name: '8C', variant: '64 GB', price: 1680 },
  { brand: 'Honor', name: '7X', variant: '64 GB', price: 1550 }
];

function normalizeKey(str) {
  return (str || '')
    .toLowerCase()
    .replace(/^samsung\s+|^motorola\s+|^moto\s+|^infinix\s+|^google\s+|^honor\s+/i, '')
    .replace(/\s*5g\b/gi, '')
    .replace(/\s*\(.*?\)/g, '')
    .replace(/[^a-z0-9]/g, '');
}

async function run() {
  console.log(`Starting synchronization for ${allBrandPrices.length} models across 7 brands...`);

  // 1. UPDATE server/config/phonesCatalog.json
  const phonesCatalogPath = path.join(__dirname, '../server/config/phonesCatalog.json');
  let phonesCatalog = [];
  if (fs.existsSync(phonesCatalogPath)) {
    phonesCatalog = JSON.parse(fs.readFileSync(phonesCatalogPath, 'utf8'));
  }
  let phonesCatalogUpdated = 0;

  phonesCatalog.forEach(phone => {
    const brand = phone.brand;
    const phoneNorm = normalizeKey(phone.model);
    const match = allBrandPrices.find(p => p.brand.toLowerCase() === brand.toLowerCase() && normalizeKey(p.name) === phoneNorm);
    if (match) {
      phone.base_resale_value = match.price;
      phone.price = match.price;
      phonesCatalogUpdated++;
    }
  });
  fs.writeFileSync(phonesCatalogPath, JSON.stringify(phonesCatalog, null, 2), 'utf8');
  console.log(`phonesCatalog.json: Updated ${phonesCatalogUpdated} models.`);

  // 2. UPDATE src/data/masterModelCatalog.ts
  const masterCatalogPath = path.join(__dirname, '../src/data/masterModelCatalog.ts');
  let masterContent = fs.readFileSync(masterCatalogPath, 'utf8');
  let masterUpdated = 0;

  allBrandPrices.forEach(item => {
    const cleanPattern = item.name.replace(/\\/g, '\\\\').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(model:\\s*['"](?:${item.brand}\\s+)?${cleanPattern}['"][\\s\\S]*?basePrice:\\s*)\\d+`, 'gi');
    if (regex.test(masterContent)) {
      masterContent = masterContent.replace(regex, `$1${item.price}`);
      masterUpdated++;
    }
  });
  fs.writeFileSync(masterCatalogPath, masterContent, 'utf8');
  console.log(`masterModelCatalog.ts: Updated ${masterUpdated} models.`);

  // 3. UPDATE src/data/indianPhonesCatalog.ts
  const indianCatalogPath = path.join(__dirname, '../src/data/indianPhonesCatalog.ts');
  let indianContent = fs.readFileSync(indianCatalogPath, 'utf8');
  let indianUpdated = 0;

  allBrandPrices.forEach(item => {
    const cleanPattern = item.name.replace(/\\/g, '\\\\').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(model:\\s*['"](?:${item.brand}\\s+)?${cleanPattern}['"][\\s\\S]*?price:\\s*)\\d+`, 'gi');
    if (regex.test(indianContent)) {
      indianContent = indianContent.replace(regex, `$1${item.price}`);
      indianUpdated++;
    }
  });
  fs.writeFileSync(indianCatalogPath, indianContent, 'utf8');
  console.log(`indianPhonesCatalog.ts: Updated ${indianUpdated} models.`);

  // 4. UPDATE src/data/brandSeriesCatalog.ts
  const brandSeriesCatalogPath = path.join(__dirname, '../src/data/brandSeriesCatalog.ts');
  let brandSeriesContent = fs.readFileSync(brandSeriesCatalogPath, 'utf8');
  let brandSeriesUpdated = 0;

  allBrandPrices.forEach(item => {
    const cleanPattern = item.name.replace(/\\/g, '\\\\').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(model:\\s*['"](?:${item.brand}\\s+)?${cleanPattern}['"][\\s\\S]*?price:\\s*)\\d+`, 'gi');
    if (regex.test(brandSeriesContent)) {
      brandSeriesContent = brandSeriesContent.replace(regex, `$1${item.price}`);
      brandSeriesUpdated++;
    }
  });
  fs.writeFileSync(brandSeriesCatalogPath, brandSeriesContent, 'utf8');
  console.log(`brandSeriesCatalog.ts: Updated ${brandSeriesUpdated} models.`);

  // 5. UPDATE MongoDB Atlas
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || 'fundu' });
  const db = mongoose.connection.db;

  let mongoMasterUpdated = 0;
  let mongoConfigUpdated = 0;

  for (const item of allBrandPrices) {
    const cleanModel = item.name.replace(new RegExp(`^${item.brand}\\s+`, 'i'), '');
    const normK = normalizeKey(cleanModel);

    // Update masterphones collection
    const resMaster = await db.collection('masterphones').updateMany(
      {
        brand: { $regex: new RegExp(`^${item.brand}$`, 'i') },
        $or: [
          { model: new RegExp(`^${cleanModel.replace(/[^a-zA-Z0-9]/g, '.*')}$`, 'i') },
          { model: new RegExp(`^${item.brand}\\s+${cleanModel.replace(/[^a-zA-Z0-9]/g, '.*')}$`, 'i') }
        ]
      },
      {
        $set: {
          base_resale_value: item.price,
          price: item.price,
          updated_at: new Date()
        }
      }
    );
    mongoMasterUpdated += resMaster.modifiedCount;

    // Upsert into sellpriceconfigs collection
    const storageClean = item.variant.replace(/\s+/g, '');
    await db.collection('sellpriceconfigs').deleteMany({
      brand: { $regex: new RegExp(`^${item.brand}$`, 'i') },
      $expr: {
        $regexMatch: {
          input: { $replaceAll: { input: { $toLower: '$model' }, find: ' ', replacement: '' } },
          regex: `^${normK}$`
        }
      }
    });

    await db.collection('sellpriceconfigs').insertOne({
      brand: item.brand,
      model: cleanModel,
      storage: storageClean,
      base_price: item.price,
      excellent_multiplier: 0.85,
      good_multiplier: 0.70,
      fair_multiplier: 0.55,
      box_bonus: 500,
      charger_bonus: 400,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    });
    mongoConfigUpdated++;
  }

  console.log(`\n🎉 SYNC SUMMARY:`);
  console.log(`- masterphones modified in Atlas: ${mongoMasterUpdated}`);
  console.log(`- sellpriceconfigs upserted in Atlas (Admin Panel): ${mongoConfigUpdated}`);

  await mongoose.disconnect();
  console.log('✅ Synchronization Complete!');
}

run().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
