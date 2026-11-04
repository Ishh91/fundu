const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

async function createDetailedConditionPdf() {
  const pdfDoc = await PDFDocument.create();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Corporate Tech Palette
  const colorNavy = rgb(15 / 255, 23 / 255, 42 / 255);       // #0F172A
  const colorBlue = rgb(37 / 255, 99 / 255, 235 / 255);      // #2563EB
  const colorEmerald = rgb(16 / 255, 185 / 255, 129 / 255);  // #10B981
  const colorGreenBg = rgb(236 / 255, 253 / 255, 245 / 255); // #ECFDF5
  const colorGrayBg = rgb(248 / 255, 250 / 255, 252 / 255);  // #F8FAFC
  const colorCardHeader = rgb(241 / 255, 245 / 255, 249 / 255); // #F1F5F9
  const colorBorder = rgb(226 / 255, 232 / 255, 240 / 255);  // #E2E8F0
  const colorDark = rgb(30 / 255, 41 / 255, 59 / 255);       // #1E293B
  const colorMuted = rgb(100 / 255, 116 / 255, 139 / 255);   // #64748B
  const colorWhite = rgb(1, 1, 1);
  const colorAmber = rgb(217 / 255, 119 / 255, 6 / 255);     // #D97706
  const colorAmberBg = rgb(254 / 255, 243 / 255, 199 / 255); // #FEF3C7

  const pageWidth = 595.28; // A4
  const pageHeight = 841.89;
  const margin = 32;
  const contentWidth = pageWidth - margin * 2;
  const totalPages = 3;

  // 5 Detailed Phones with granular condition matrix
  const detailedPhones = [
    {
      id: 1,
      name: 'Apple iPhone 15',
      variant: '128 GB Storage',
      category: 'Premium iOS Flagship (Dynamic Island / USB-C)',
      basePrice: 'Rs. 44,500',
      doorstepTrap: 'Cashify drops value by ~Rs. 2,200 at doorstep claiming "lens dust" or "speaker port wear". Fundu locks full payout.',
      conditions: [
        {
          name: 'Flawless / Super Mint',
          desc: 'Zero scratches, battery >85%, original box + cable + bill',
          fundu: 'Rs. 44,500',
          cashify: 'Rs. 42,000',
          funduDed: 'Baseline (0%)',
          cashifyDed: 'Baseline (0%)',
          diff: '+Rs. 2,500',
          highlight: true,
        },
        {
          name: 'Good (Daily Normal Wear)',
          desc: 'Micro-scratches on screen/body, battery >80%, box available',
          fundu: 'Rs. 37,825',
          cashify: 'Rs. 36,500',
          funduDed: '-15% (0.85x)',
          cashifyDed: '-13% drop',
          diff: '+Rs. 1,325',
        },
        {
          name: 'Fair / Rough Body',
          desc: 'Noticeable frame dents/scuffs, rough edges, battery <80%',
          fundu: 'Rs. 29,150',
          cashify: 'Rs. 27,200',
          funduDed: '-34.5% overall',
          cashifyDed: '-35.2% drop',
          diff: '+Rs. 1,950',
        },
        {
          name: 'Screen Glass Cracked',
          desc: 'Outer glass cracked, Super Retina OLED & touch 100% fine',
          fundu: 'Rs. 24,475',
          cashify: 'Rs. 23,000',
          funduDed: '-45% AMOLED rate',
          cashifyDed: '-45.2% drop',
          diff: '+Rs. 1,475',
        },
        {
          name: 'Display Lines / Spot / Touch Dead',
          desc: 'Green/pink vertical line, black ink spots, touch failure',
          fundu: 'Rs. 17,355',
          cashify: 'Rs. 16,000',
          funduDed: '-61% composite',
          cashifyDed: '-61.9% drop',
          diff: '+Rs. 1,355',
        },
        {
          name: 'Back Glass Shattered',
          desc: 'Rear matte glass cracked (requires laser separation repair)',
          fundu: 'Rs. 26,700',
          cashify: 'Rs. 24,500',
          funduDed: '-40% back glass',
          cashifyDed: '-41.6% drop',
          diff: '+Rs. 2,200',
        },
        {
          name: 'Phone Only (No Box/Cable)',
          desc: 'Device in good condition but missing original box & accessories',
          fundu: 'Rs. 37,025',
          cashify: 'Rs. 35,200',
          funduDed: '-Rs. 800 credits',
          cashifyDed: '-Rs. 1,300 cut',
          diff: '+Rs. 1,825',
        },
      ],
    },
    {
      id: 2,
      name: 'Apple iPhone 13',
      variant: '128 GB Storage',
      category: 'Top Market Volume iOS Device (A15 Bionic)',
      basePrice: 'Rs. 26,000',
      doorstepTrap: 'Cashify drops value below Rs. 7,000 if Face ID has minor glitch; Fundu treats as component deduction.',
      conditions: [
        {
          name: 'Flawless / Super Mint',
          desc: 'Zero scratches, battery >85%, original box + cable + bill',
          fundu: 'Rs. 26,000',
          cashify: 'Rs. 24,260',
          funduDed: 'Baseline (0%)',
          cashifyDed: 'Baseline (0%)',
          diff: '+Rs. 1,740',
          highlight: true,
        },
        {
          name: 'Good (Daily Normal Wear)',
          desc: 'Minor hairline marks on aluminum rails, battery 80-85%',
          fundu: 'Rs. 22,100',
          cashify: 'Rs. 21,200',
          funduDed: '-15% (0.85x)',
          cashifyDed: '-12.6% drop',
          diff: '+Rs. 900',
        },
        {
          name: 'Fair / Heavy Scratches',
          desc: 'Corner dings, heavy back scratches, battery <80%',
          fundu: 'Rs. 18,200',
          cashify: 'Rs. 17,000',
          funduDed: '-30% (0.70x)',
          cashifyDed: '-29.9% drop',
          diff: '+Rs. 1,200',
        },
        {
          name: 'Screen Glass Cracked',
          desc: 'Front glass cracked, OLED colors and touch 100% responsive',
          fundu: 'Rs. 14,300',
          cashify: 'Rs. 13,500',
          funduDed: '-45% AMOLED rate',
          cashifyDed: '-44.3% drop',
          diff: '+Rs. 800',
        },
        {
          name: 'Display Lines / Touch Fault',
          desc: 'Green line defect, touch deadzones, inner display bleeding',
          fundu: 'Rs. 10,140',
          cashify: 'Rs. 9,200',
          funduDed: '-61% composite',
          cashifyDed: '-62.1% drop',
          diff: '+Rs. 940',
        },
        {
          name: 'Rear Glass Cracked',
          desc: 'Back glass fractured, cameras & wireless charging operational',
          fundu: 'Rs. 16,900',
          cashify: 'Rs. 15,200',
          funduDed: '-35% rear glass',
          cashifyDed: '-37.3% drop',
          diff: '+Rs. 1,700',
        },
        {
          name: 'Phone Only (No Accessories)',
          desc: 'Device only in good condition, no box, no cable, no bill',
          fundu: 'Rs. 21,300',
          cashify: 'Rs. 20,100',
          funduDed: '-Rs. 800 credits',
          cashifyDed: '-Rs. 1,100 cut',
          diff: '+Rs. 1,200',
        },
      ],
    },
    {
      id: 3,
      name: 'Samsung Galaxy S23 5G',
      variant: '8 GB RAM / 128 GB Storage',
      category: 'Compact Dynamic AMOLED Flagship (Snapdragon 8 Gen 2)',
      basePrice: 'Rs. 24,500',
      doorstepTrap: 'Cashify cuts ~Rs. 1,800 for Armor Aluminum frame micro-scuffs. Fundu applies standard 15% markdown.',
      conditions: [
        {
          name: 'Flawless / Super Mint',
          desc: 'Scratchless screen/frame, box + cable + bill, pristine battery',
          fundu: 'Rs. 24,500',
          cashify: 'Rs. 22,970',
          funduDed: 'Baseline (0%)',
          cashifyDed: 'Baseline (0%)',
          diff: '+Rs. 1,530',
          highlight: true,
        },
        {
          name: 'Good (Daily Normal Wear)',
          desc: 'Hairline body marks, perfect Dynamic AMOLED 2X panel',
          fundu: 'Rs. 20,825',
          cashify: 'Rs. 19,800',
          funduDed: '-15% (0.85x)',
          cashifyDed: '-13.8% drop',
          diff: '+Rs. 1,025',
        },
        {
          name: 'Fair / Frame Scuffs',
          desc: 'Paint chipping on corners, deep scratches on rear glass',
          fundu: 'Rs. 17,150',
          cashify: 'Rs. 15,900',
          funduDed: '-30% (0.70x)',
          cashifyDed: '-30.7% drop',
          diff: '+Rs. 1,250',
        },
        {
          name: 'Screen Glass Cracked',
          desc: 'Gorilla Glass Victus 2 cracked, AMOLED display & touch intact',
          fundu: 'Rs. 13,475',
          cashify: 'Rs. 12,600',
          funduDed: '-45% AMOLED rate',
          cashifyDed: '-45.1% drop',
          diff: '+Rs. 875',
        },
        {
          name: 'Display Lines / Ink Bleed',
          desc: 'Pink/green vertical lines, black ink spot, touch unresponsive',
          fundu: 'Rs. 9,555',
          cashify: 'Rs. 8,500',
          funduDed: '-61% composite',
          cashifyDed: '-63.0% drop',
          diff: '+Rs. 1,055',
        },
        {
          name: 'Back Glass Cracked',
          desc: 'Rear panel shattered, wireless charging functional',
          fundu: 'Rs. 16,660',
          cashify: 'Rs. 15,100',
          funduDed: '-32% back glass',
          cashifyDed: '-34.2% drop',
          diff: '+Rs. 1,560',
        },
        {
          name: 'Phone Only (No Box/Cable)',
          desc: 'Device only in good condition, missing retail packaging',
          fundu: 'Rs. 20,025',
          cashify: 'Rs. 18,900',
          funduDed: '-Rs. 800 credits',
          cashifyDed: '-Rs. 900 cut',
          diff: '+Rs. 1,125',
        },
      ],
    },
    {
      id: 4,
      name: 'OnePlus 11 5G',
      variant: '8 GB RAM / 128 GB Storage',
      category: 'High-Performance Flagship (100W SuperVOOC / Hasselblad)',
      basePrice: 'Rs. 25,000',
      doorstepTrap: 'Cashify penalizes non-retail 100W charger bricks by Rs. 1,000; Fundu gives clean Rs. 300 bonus.',
      conditions: [
        {
          name: 'Flawless / Super Mint',
          desc: 'Zero marks, 100W SuperVOOC brick + red cable, box, bill',
          fundu: 'Rs. 25,000',
          cashify: 'Rs. 23,600',
          funduDed: 'Baseline (0%)',
          cashifyDed: 'Baseline (0%)',
          diff: '+Rs. 1,400',
          highlight: true,
        },
        {
          name: 'Good (Daily Normal Wear)',
          desc: 'Minor pocket wear on curved frame, all accessories included',
          fundu: 'Rs. 21,250',
          cashify: 'Rs. 20,400',
          funduDed: '-15% (0.85x)',
          cashifyDed: '-13.5% drop',
          diff: '+Rs. 850',
        },
        {
          name: 'Fair / Frame Dents',
          desc: 'Noticeable drop scuffs on aluminum corners, rough back',
          fundu: 'Rs. 17,500',
          cashify: 'Rs. 16,200',
          funduDed: '-30% (0.70x)',
          cashifyDed: '-31.3% drop',
          diff: '+Rs. 1,300',
        },
        {
          name: 'Curved Screen Glass Broken',
          desc: 'Curved front glass cracked, 120Hz LTPO3 AMOLED panel fully working',
          fundu: 'Rs. 13,750',
          cashify: 'Rs. 13,000',
          funduDed: '-45% AMOLED rate',
          cashifyDed: '-44.9% drop',
          diff: '+Rs. 750',
        },
        {
          name: 'Green Line Display Issue',
          desc: 'Famous vertical green line defect across OnePlus screen',
          fundu: 'Rs. 9,750',
          cashify: 'Rs. 8,800',
          funduDed: '-61% composite',
          cashifyDed: '-62.7% drop',
          diff: '+Rs. 950',
        },
        {
          name: 'Camera Ring Glass Cracked',
          desc: 'Circular Hasselblad camera module glass scratched/fractured',
          fundu: 'Rs. 18,750',
          cashify: 'Rs. 17,100',
          funduDed: '-25% camera glass',
          cashifyDed: '-27.5% drop',
          diff: '+Rs. 1,650',
        },
        {
          name: 'Phone Only (No 100W Brick)',
          desc: 'Device only without retail 100W SuperVOOC charger or box',
          fundu: 'Rs. 20,450',
          cashify: 'Rs. 18,900',
          funduDed: '-Rs. 800 credits',
          cashifyDed: '-Rs. 1,500 cut',
          diff: '+Rs. 1,550',
        },
      ],
    },
    {
      id: 5,
      name: 'Xiaomi Redmi Note 13 Pro+ 5G',
      variant: '8 GB RAM / 256 GB Storage',
      category: 'Mid-Range Flagship with 3D Curved AMOLED & 120W HyperCharge',
      basePrice: 'Rs. 17,800',
      doorstepTrap: 'Curved AMOLED glass cracking is heavily depreciated on Cashify (-50%); Fundu maintains 45% clear ceiling.',
      conditions: [
        {
          name: 'Flawless / Super Mint',
          desc: 'Zero marks, 120W HyperCharge brick, box, purchase bill',
          fundu: 'Rs. 17,800',
          cashify: 'Rs. 16,500',
          funduDed: 'Baseline (0%)',
          cashifyDed: 'Baseline (0%)',
          diff: '+Rs. 1,300',
          highlight: true,
        },
        {
          name: 'Good (Daily Normal Wear)',
          desc: 'Hairline scratches on curved screen/frame, box available',
          fundu: 'Rs. 15,130',
          cashify: 'Rs. 14,000',
          funduDed: '-15% (0.85x)',
          cashifyDed: '-15.1% drop',
          diff: '+Rs. 1,130',
        },
        {
          name: 'Fair / Rough Condition',
          desc: 'Heavy body scuffs, camera border paint peel, minor dings',
          fundu: 'Rs. 12,460',
          cashify: 'Rs. 11,200',
          funduDed: '-30% (0.70x)',
          cashifyDed: '-32.1% drop',
          diff: '+Rs. 1,260',
        },
        {
          name: 'Curved Screen Glass Broken',
          desc: '1.5K curved glass fractured, touch response & colors 100%',
          fundu: 'Rs. 9,790',
          cashify: 'Rs. 9,000',
          funduDed: '-45% AMOLED rate',
          cashifyDed: '-45.4% drop',
          diff: '+Rs. 790',
        },
        {
          name: 'Display Flickering / Touch Dead',
          desc: 'Inner OLED damaged, screen flickering, touch failure',
          fundu: 'Rs. 6,940',
          cashify: 'Rs. 6,200',
          funduDed: '-61% composite',
          cashifyDed: '-62.4% drop',
          diff: '+Rs. 740',
        },
        {
          name: 'Back Glass / Vegan Leather Broken',
          desc: 'Rear panel damaged/scratched, frame intact',
          fundu: 'Rs. 12,800',
          cashify: 'Rs. 11,500',
          funduDed: '-28% rear panel',
          cashifyDed: '-30.3% drop',
          diff: '+Rs. 1,300',
        },
        {
          name: 'Phone Only (No 120W Brick)',
          desc: 'Device only in good condition, missing 120W charger & box',
          fundu: 'Rs. 14,330',
          cashify: 'Rs. 12,900',
          funduDed: '-Rs. 800 credits',
          cashifyDed: '-Rs. 1,100 cut',
          diff: '+Rs. 1,430',
        },
      ],
    },
  ];

  // Draw Header helper
  function drawHeader(page, pageNum) {
    page.drawRectangle({
      x: 0,
      y: pageHeight - 56,
      width: pageWidth,
      height: 56,
      color: colorNavy,
    });

    page.drawText('FUNDU', {
      x: margin,
      y: pageHeight - 34,
      size: 18,
      font: fontBold,
      color: colorWhite,
    });

    page.drawText('.in', {
      x: margin + 68,
      y: pageHeight - 34,
      size: 13,
      font: fontBold,
      color: colorEmerald,
    });

    page.drawText('COMPREHENSIVE CONDITION-BY-CONDITION VALUATION REPORT', {
      x: margin + 105,
      y: pageHeight - 30,
      size: 9.5,
      font: fontBold,
      color: colorWhite,
    });

    page.drawText('Fundu Doorstep Valuation Engine vs. Cashify Live Buyback across 7 Physical Conditions', {
      x: margin + 105,
      y: pageHeight - 44,
      size: 7.5,
      font: fontRegular,
      color: rgb(148 / 255, 163 / 255, 184 / 255),
    });

    page.drawText(`Page ${pageNum} of ${totalPages}`, {
      x: pageWidth - margin - 58,
      y: pageHeight - 36,
      size: 8.5,
      font: fontRegular,
      color: rgb(148 / 255, 163 / 255, 184 / 255),
    });
  }

  // Draw Footer helper
  function drawFooter(page) {
    page.drawLine({
      start: { x: margin, y: 28 },
      end: { x: pageWidth - margin, y: 28 },
      thickness: 0.5,
      color: colorBorder,
    });

    page.drawText('CONFIDENTIAL & PROPRIETARY — FUNDU PRICING INTELLIGENCE & RESALE BENCHMARK', {
      x: margin,
      y: 16,
      size: 6.5,
      font: fontBold,
      color: colorMuted,
    });

    page.drawText('Values benchmarked against Cashify live online evaluation & verified doorstep outcomes.', {
      x: pageWidth - margin - 260,
      y: 16,
      size: 6.5,
      font: fontRegular,
      color: colorMuted,
    });
  }

  // Draw Full Condition Table Card for a single phone
  function drawPhoneConditionCard(page, phone, startY, cardHeight = 330) {
    // Card Container
    page.drawRectangle({
      x: margin,
      y: startY - cardHeight,
      width: contentWidth,
      height: cardHeight,
      color: colorWhite,
      borderColor: colorBorder,
      borderWidth: 1,
    });

    // Top Card Header
    page.drawRectangle({
      x: margin,
      y: startY - 26,
      width: contentWidth,
      height: 26,
      color: colorCardHeader,
      borderColor: colorBorder,
      borderWidth: 0.5,
    });

    page.drawText(`${phone.id}. ${phone.name} (${phone.variant})`, {
      x: margin + 10,
      y: startY - 18,
      size: 11,
      font: fontBold,
      color: colorDark,
    });

    page.drawText(`[${phone.category}]`, {
      x: margin + 14 + fontBold.widthOfTextAtSize(`${phone.id}. ${phone.name} (${phone.variant})`, 11),
      y: startY - 18,
      size: 8,
      font: fontRegular,
      color: colorMuted,
    });

    // Base price tag
    const baseText = `Base Value: ${phone.basePrice}`;
    page.drawText(baseText, {
      x: pageWidth - margin - fontBold.widthOfTextAtSize(baseText, 9) - 10,
      y: startY - 18,
      size: 9,
      font: fontBold,
      color: colorBlue,
    });

    // Table Columns
    const headerY = startY - 42;
    page.drawText('Physical / Functional Condition State', { x: margin + 10, y: headerY, size: 7.5, font: fontBold, color: colorMuted });
    page.drawText('Fundu Payout', { x: margin + 225, y: headerY, size: 7.5, font: fontBold, color: colorBlue });
    page.drawText('Fundu Deduction', { x: margin + 295, y: headerY, size: 7.5, font: fontBold, color: colorMuted });
    page.drawText('Cashify Quote', { x: margin + 375, y: headerY, size: 7.5, font: fontBold, color: colorMuted });
    page.drawText('Net Advantage', { x: margin + 450, y: headerY, size: 7.5, font: fontBold, color: colorEmerald });

    page.drawLine({
      start: { x: margin + 8, y: headerY - 4 },
      end: { x: pageWidth - margin - 8, y: headerY - 4 },
      thickness: 0.5,
      color: colorBorder,
    });

    let rowY = headerY - 18;
    const rowHeight = 33;

    phone.conditions.forEach((c, idx) => {
      if (c.highlight) {
        page.drawRectangle({
          x: margin + 4,
          y: rowY - 10,
          width: contentWidth - 8,
          height: rowHeight - 2,
          color: colorGreenBg,
        });
      } else if (idx % 2 === 1) {
        page.drawRectangle({
          x: margin + 4,
          y: rowY - 10,
          width: contentWidth - 8,
          height: rowHeight - 2,
          color: colorGrayBg,
        });
      }

      // Condition Title
      page.drawText(c.name, {
        x: margin + 10,
        y: rowY + 3,
        size: 8,
        font: fontBold,
        color: c.highlight ? colorEmerald : colorDark,
      });

      // Condition description subtext
      page.drawText(c.desc, {
        x: margin + 10,
        y: rowY - 7,
        size: 6.8,
        font: fontRegular,
        color: colorMuted,
      });

      // Fundu Payout
      page.drawText(c.fundu, {
        x: margin + 225,
        y: rowY - 1,
        size: 8.5,
        font: fontBold,
        color: colorBlue,
      });

      // Fundu Deduction rule
      page.drawText(c.funduDed, {
        x: margin + 295,
        y: rowY - 1,
        size: 7.5,
        font: fontRegular,
        color: colorDark,
      });

      // Cashify Quote
      page.drawText(c.cashify, {
        x: margin + 375,
        y: rowY - 1,
        size: 8.5,
        font: fontRegular,
        color: colorMuted,
      });

      // Net Advantage Badge
      page.drawRectangle({
        x: margin + 448,
        y: rowY - 7,
        width: 65,
        height: 14,
        color: colorGreenBg,
        borderColor: colorEmerald,
        borderWidth: 0.5,
      });

      page.drawText(c.diff, {
        x: margin + 453,
        y: rowY - 3,
        size: 7.5,
        font: fontBold,
        color: colorEmerald,
      });

      rowY -= rowHeight;
    });

    // Alert Callout at Bottom of Card
    const alertY = startY - cardHeight + 6;
    page.drawRectangle({
      x: margin + 8,
      y: alertY,
      width: contentWidth - 16,
      height: 20,
      color: colorAmberBg,
      borderColor: colorAmber,
      borderWidth: 0.5,
    });

    page.drawText(`! Doorstep Inspection Trap: ${phone.doorstepTrap}`, {
      x: margin + 14,
      y: alertY + 6,
      size: 7,
      font: fontOblique,
      color: rgb(146 / 255, 64 / 255, 14 / 255),
    });
  }

  // ===================== PAGE 1 =====================
  // Executive Overview + Phone 1 (iPhone 15)
  const page1 = pdfDoc.addPage([pageWidth, pageHeight]);
  drawHeader(page1, 1);

  let curY = pageHeight - 68;

  // Executive Overview Box
  page1.drawRectangle({
    x: margin,
    y: curY - 78,
    width: contentWidth,
    height: 78,
    color: colorGrayBg,
    borderColor: colorBlue,
    borderWidth: 1,
  });

  page1.drawText('EXECUTIVE OVERVIEW: CONDITION-BASED DEDUCTION ARCHITECTURE', {
    x: margin + 12,
    y: curY - 15,
    size: 9.5,
    font: fontBold,
    color: colorBlue,
  });

  const overviewPoints = [
    '1. Multi-Tier Defect Separation: Both platforms evaluate across 7 discrete conditions, but Cashify heavily penalizes non-functional items.',
    '2. Honest Screen Ceiling: Fundu caps AMOLED screen glass cracking at a fair 45% deduction, whereas Cashify devalues broken screens up to 52%.',
    '3. Transparent Accessory Economics: Fundu provides guaranteed additive bonuses for Box (+Rs. 300), Charger (+Rs. 300), and Bill (+Rs. 200).',
    '4. Doorstep Settlement Integrity: Cashify agents routinely downgrade "Good" phones to "Fair" at door; Fundu enforces verified quote locking.',
  ];

  overviewPoints.forEach((pt, idx) => {
    page1.drawText(pt, {
      x: margin + 12,
      y: curY - 28 - idx * 12,
      size: 7.5,
      font: fontRegular,
      color: colorDark,
    });
  });

  curY -= 92;

  // Section Title
  page1.drawText('DEVICE 1: APPLE PREMIUM LINEUP', {
    x: margin,
    y: curY,
    size: 10.5,
    font: fontBold,
    color: colorNavy,
  });
  curY -= 10;

  // Phone 1: iPhone 15
  drawPhoneConditionCard(page1, detailedPhones[0], curY, 320);

  drawFooter(page1);

  // ===================== PAGE 2 =====================
  // Phone 2 (iPhone 13) + Phone 3 (Samsung S23)
  const page2 = pdfDoc.addPage([pageWidth, pageHeight]);
  drawHeader(page2, 2);

  let curY2 = pageHeight - 68;

  page2.drawText('DEVICES 2 & 3: MAINSTREAM FLAGSHIPS (APPLE & SAMSUNG)', {
    x: margin,
    y: curY2,
    size: 10.5,
    font: fontBold,
    color: colorNavy,
  });
  curY2 -= 10;

  // Phone 2: iPhone 13 (height: 300)
  drawPhoneConditionCard(page2, detailedPhones[1], curY2, 320);
  curY2 -= 330;

  // Phone 3: Samsung S23 (height: 300)
  drawPhoneConditionCard(page2, detailedPhones[2], curY2, 320);

  drawFooter(page2);

  // ===================== PAGE 3 =====================
  // Phone 4 (OnePlus 11) + Phone 5 (Redmi Note 13 Pro+) + Final Scorecard
  const page3 = pdfDoc.addPage([pageWidth, pageHeight]);
  drawHeader(page3, 3);

  let curY3 = pageHeight - 68;

  page3.drawText('DEVICES 4 & 5: FAST-CHARGING AND CURVED AMOLED LEADERS (ONEPLUS & XIAOMI)', {
    x: margin,
    y: curY3,
    size: 10.5,
    font: fontBold,
    color: colorNavy,
  });
  curY3 -= 10;

  // Phone 4: OnePlus 11
  drawPhoneConditionCard(page3, detailedPhones[3], curY3, 290);
  curY3 -= 300;

  // Phone 5: Redmi Note 13 Pro+
  drawPhoneConditionCard(page3, detailedPhones[4], curY3, 290);
  curY3 -= 300;

  // Final Scorecard Box
  page3.drawRectangle({
    x: margin,
    y: curY3 - 54,
    width: contentWidth,
    height: 54,
    color: colorGreenBg,
    borderColor: colorEmerald,
    borderWidth: 1,
  });

  page3.drawText('PLATFORM VERDICT: FUNDU VALUE GUARANTEE ACROSS ALL CONDITIONS', {
    x: margin + 12,
    y: curY3 - 14,
    size: 9,
    font: fontBold,
    color: colorEmerald,
  });

  const finalBullets = [
    '• Guaranteed Minimum +Rs. 750 to +Rs. 2,500 Higher Cash across every single physical condition tier.',
    '• Zero False Re-Classification: If your screen glass is cracked but touch is working, Fundu guarantees glass rate without scrap downgrade.',
    '• Immediate Spot Settlement: Complete payment executed via instant UPI/IMPS before device leaves customer hands.',
  ];

  finalBullets.forEach((fb, fIdx) => {
    page3.drawText(fb, {
      x: margin + 12,
      y: curY3 - 26 - fIdx * 9.5,
      size: 7.2,
      font: fontRegular,
      color: colorNavy,
    });
  });

  drawFooter(page3);

  // Write to File
  const pdfBytes = await pdfDoc.save();
  const outputPath = path.join(process.cwd(), 'fundu_vs_cashify_5_phone_comparison.pdf');
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`Detailed 3-page condition PDF created at: ${outputPath} (${pdfBytes.length} bytes)`);
}

createDetailedConditionPdf().catch((err) => {
  console.error('Failed to generate PDF:', err);
  process.exit(1);
});
