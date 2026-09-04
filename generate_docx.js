import fs from 'fs';
import path from 'path';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType
} from 'docx';

// Colors
const PRIMARY_COLOR = '15803D'; // Emerald green
const SECONDARY_COLOR = '166534';
const ACCENT_COLOR = '047857';
const BG_LIGHT = 'F0FDF4';
const TEXT_MUTED = '4B5563';

function createHeading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 180 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 28,
        color: PRIMARY_COLOR,
        font: 'Segoe UI'
      })
    ]
  });
}

function createHeading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 24,
        color: SECONDARY_COLOR,
        font: 'Segoe UI'
      })
    ]
  });
}

function createBullet(text, boldPrefix = '') {
  const children = [];
  if (boldPrefix) {
    children.push(new TextRun({ text: boldPrefix + ' ', bold: true, font: 'Segoe UI', size: 22 }));
  }
  children.push(new TextRun({ text, font: 'Segoe UI', size: 22 }));

  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 60, after: 60 },
    children
  });
}

function createSubBullet(text, boldPrefix = '') {
  const children = [];
  if (boldPrefix) {
    children.push(new TextRun({ text: boldPrefix + ' ', bold: true, font: 'Segoe UI', size: 20 }));
  }
  children.push(new TextRun({ text, font: 'Segoe UI', size: 20 }));

  return new Paragraph({
    bullet: { level: 1 },
    spacing: { before: 40, after: 40 },
    children
  });
}

function createParagraph(text, isItalic = false) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    children: [
      new TextRun({
        text,
        italics: isItalic,
        font: 'Segoe UI',
        size: 22
      })
    ]
  });
}

function createCalloutBox(title, content) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: PRIMARY_COLOR },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: PRIMARY_COLOR },
      left: { style: BorderStyle.SINGLE, size: 24, color: PRIMARY_COLOR },
      right: { style: BorderStyle.SINGLE, size: 4, color: PRIMARY_COLOR },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: BG_LIGHT },
            margins: { top: 180, bottom: 180, left: 240, right: 240 },
            children: [
              new Paragraph({
                spacing: { before: 60, after: 60 },
                children: [
                  new TextRun({
                    text: title,
                    bold: true,
                    size: 22,
                    color: PRIMARY_COLOR,
                    font: 'Segoe UI'
                  })
                ]
              }),
              new Paragraph({
                spacing: { before: 60, after: 60 },
                children: [
                  new TextRun({
                    text: content,
                    size: 20,
                    color: TEXT_MUTED,
                    font: 'Segoe UI'
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
}

async function generateManualDocx() {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
          }
        },
        children: [
          // Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: 'HƯỚNG DẪN SỬ DỤNG APP VƯỜN NHA ĐAM',
                bold: true,
                size: 34,
                color: PRIMARY_COLOR,
                font: 'Segoe UI'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 240 },
            children: [
              new TextRun({
                text: 'QUY TRÌNH THAO TÁC TINH GỌN (≤ 3 CHẠM) DÀNH CHO CHỊ THUÝ 🌿',
                bold: true,
                size: 24,
                color: SECONDARY_COLOR,
                font: 'Segoe UI'
              })
            ]
          }),

          createCalloutBox(
            '🌟 CÁC NÂNG CẤP VẬN HÀNH TINH GỌN MỚI NHẤT',
            '1. Lặp lại mẻ vi sinh gần nhất CHỈ 1 CHẠM: Bấm nút "🔁 Lặp lại mẻ gần nhất" là tự động tạo mẻ với đúng công thức & trừ kho ngay.\n2. Bán hàng bấm thẳng vào thẻ sản phẩm (1 chạm) thay vì chọn menu xổ xuống.\n3. Giao diện tự động co giãn vừa khít màn hình điện thoại (375-430px), hoàn toàn không tràn ngang.\n4. Bổ sung nút "📥 Xuất báo cáo" trong Lịch tác nghiệp để tải file Excel (.xlsx) nhật ký canh tác.'
          ),

          // 1. Khởi động
          createHeading1('1. CÁCH MỞ ỨNG DỤNG HÀNG NGÀY'),
          createBullet('Mở thư mục "G:\\Drive của tôi\\PROJECTS\\vuon_nha_dam_app\\" -> Nhấp đúp chuột vào file CHAY_APP.bat. Trình duyệt web sẽ tự động mở lên giao diện làm việc.', '• Trên Máy tính (PC / Laptop):'),
          createBullet('Mở trình duyệt trên điện thoại (Chrome/Safari), nhập địa chỉ hiển thị trên máy tính (VD: http://192.168.1.X:5173).', '• Trên Điện thoại:'),

          // 2. Chế biến vi sinh 1 chạm & 2 chạm
          createHeading1('2. GHI MẺ CHẾ BIẾN VI SINH / EM / GE (1 CHẠM & 2 CHẠM ⚡)'),
          createParagraph('Áp dụng khi lấy Mật rỉ đường ra để nhân giống vi sinh, làm GE Nha đam hoặc ủ rác:'),
          createBullet('Mở menu "Kho & Chế biến" -> Bấm nút màu cam "🔁 Lặp lại mẻ gần nhất". Hệ thống TỰ ĐỘNG TẠO MẺ MỚI theo đúng công thức & số lượng mẻ vừa làm gần nhất, trừ kho Mật rỉ ngay lập tức!', '• Cách 1 (Siêu nhanh - 1 CHẠM ⚡):'),
          createBullet('Khi muốn làm công thức khác hoặc lần đầu tạo mẻ:', '• Cách 2 (2 CHẠM theo mẫu):'),
          createSubBullet('Bấm nút "⚡ Ghi mẻ chế biến (2 chạm)" -> Bấm chọn 1 trong 6 thẻ công thức dựng sẵn (EM gốc, EM2, GE Nha đam, IMO, Ủ rác, Tưới cây).', 'Chạm 1:'),
          createSubBullet('Bấm nút [-] hoặc [+] số mẻ (nếu làm nhiều hơn) -> Bấm "✅ Xác nhận ghi mẻ". Tự động trừ kho Mật rỉ!', 'Chạm 2:'),

          // 3. Tạo đơn bán hàng 3 chạm
          createHeading1('3. TẠO ĐƠN BÁN HÀNG SIÊU TỐC (≤ 3 CHẠM 🛒)'),
          createParagraph('Áp dụng khi khách mua chậu mini, cây giống, lá tươi hoặc mật ong:'),
          createBullet('Ở Trang chủ hoặc menu "Bán hàng", bấm nút "⚡ Tạo đơn bán nhanh".', 'Bước 1:'),
          createBullet('Bấm trực tiếp vào THẺ SẢN PHẨM (Chậu cảnh, Cây giống, Lá tươi, Mật ong) -> Thẻ sáng xanh có dấu tích ✓ (1 CHẠM!).', 'Bước 2 (Chạm 1 - Chọn sản phẩm):'),
          createBullet('Bấm nút [+] nếu khách mua từ 2 món trở lên (nếu mua 1 món thì bỏ qua bước này).', 'Bước 3 (Chạm 2 - Chỉnh số lượng nếu cần):'),
          createBullet('Bấm nút "✅ Hoàn tất đơn bán" (Kênh Tại vườn + Khách lẻ + Đã thu đủ đã được chọn sẵn). Hệ thống TỰ ĐỘNG TRỪ TỒN KHO!', 'Bước 4 (Chạm 3 - Hoàn tất):'),
          createParagraph('*(Ghi chú: Nếu khách mua nợ, chỉ cần bỏ tích ô "Đã thu đủ tiền" và gõ số tiền khách trả trước. Sau này vào Tab "Công nợ" bấm "Thu tiền" là xong).*', true),

          // 4. Xuất báo cáo Excel
          createHeading1('4. XUẤT BÁO CÁO NHẬT KÝ CÔNG VIỆC RA EXCEL (📥)'),
          createParagraph('Áp dụng khi cần lưu trữ đối chiếu hoặc in nhật ký làm vườn:'),
          createBullet('Vào menu "Lịch tác nghiệp" -> Bấm nút "📥 Xuất báo cáo" ở góc phải trên.', 'Bước 1:'),
          createBullet('Chọn khoảng thời gian (Từ ngày -> Đến ngày) và chọn Lô vườn / Loại công việc cần xuất.', 'Bước 2:'),
          createBullet('Bấm nút "📥 Tải file Excel (.xlsx)". File Excel tải về có đầy đủ các cột STT, Ngày, Lô, Loại việc, Tên công việc, Sản lượng kg/lá, Người làm, Trạng thái.', 'Bước 3:'),

          // 5. Nhập hàng mới + Ship + Quà
          createHeading1('5. NHẬP NGUYÊN LIỆU ĐẦU VÀO, PHÍ SHIP & QUÀ TẶNG 🚚'),
          createParagraph('Áp dụng khi mua Mật rỉ đường, Men vi sinh gốc, Cám gạo, Phân bón mới về:'),
          createBullet('Vào menu "Kho & Chế biến" -> Bấm nút "+ Nhập hàng mới".', 'Bước 1:'),
          createBullet('Chọn nguyên liệu, nhập Số lượng mua và Tổng số tiền đã thanh toán (đã bao gồm phí ship).', 'Bước 2:'),
          createBullet('Nếu có quà tặng kèm: Bấm dòng "🎁 Có hàng tặng kèm" để nhập số lượng quà tặng.', 'Bước 3:'),
          createBullet('Bấm "Lưu đợt nhập" -> Hệ thống tự động tính giá vốn bình quân cho kho.', 'Bước 4:'),

          // 6. Thu hoạch lá
          createHeading1('6. THU HOẠCH LÁ NHA ĐAM TƯƠI 📦'),
          createBullet('Ở Trang chủ, bấm nút "Thu hoạch".', 'Bước 1:'),
          createBullet('Chọn Lô đất vừa cắt lá, gõ Số kg thu hoạch (VD: 25 kg) và Số lá (tiêu chuẩn 1-2 bẹ lá già/cây).', 'Bước 2:'),
          createBullet('Bấm Lưu -> Hệ thống TỰ ĐỘNG CỘNG THẲNG 25KG VÀO TỒN KHO BÁN HÀNG LÁ TƯƠI!', 'Bước 3 (Tự động hóa):'),

          // 7. Chăm sóc & Phun thuốc
          createHeading1('7. CHĂM SÓC, PHUN THUỐC & KHÓA AN TOÀN PHI 🛡️'),
          createBullet('Khi tưới nước, bón phân, làm cỏ, tỉa lá: Mở màn hình "Việc hôm nay" -> Chạm vào dòng việc để tích xong (1 chạm).', '• Ghi chép hàng ngày:'),
          createBullet('Bấm nút "Phun thuốc" ở Trang chủ -> Chọn Lô đất + Chọn tên thuốc sinh học -> Bấm Lưu.', '• Phun thuốc BVTV:'),
          createBullet('Hệ thống tự động KHÓA THU HOẠCH LÔ ĐẤT (màu đỏ). Khi hết hạn cách ly an toàn mới tự chuyển sang màu xanh.', '• Khóa PHI tự động:'),

          // 8. Bảng tra cứu
          createHeading1('8. BẢNG TỔNG HỢP NHANH CÁC THAO TÁC THƯỜNG DÙNG'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: PRIMARY_COLOR },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Công việc thực tế', bold: true, color: 'FFFFFF', font: 'Segoe UI' })] })]
                  }),
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: PRIMARY_COLOR },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Nơi bấm trên App', bold: true, color: 'FFFFFF', font: 'Segoe UI' })] })]
                  }),
                  new TableCell({
                    shading: { type: ShadingType.CLEAR, fill: PRIMARY_COLOR },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Số bước & Thao tác', bold: true, color: 'FFFFFF', font: 'Segoe UI' })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '1. Làm lại mẻ vi sinh vừa làm', font: 'Segoe UI' })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Kho & Chế biến', font: 'Segoe UI' })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '1 Chạm: Bấm "🔁 Lặp lại mẻ gần nhất" là xong', bold: true, font: 'Segoe UI' })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '2. Lấy Mật rỉ ủ công thức mới', font: 'Segoe UI' })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Kho & Chế biến -> Ghi mẻ', font: 'Segoe UI' })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '2 Chạm: Chọn thẻ mẫu -> Bấm Xác nhận ghi mẻ', font: 'Segoe UI' })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '3. Bán chậu / cây / lá cho khách', font: 'Segoe UI' })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Trang chủ -> Tạo đơn bán', font: 'Segoe UI' })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '≤ 3 Chạm: Bấm thẻ sản phẩm -> Bấm [+] số lượng -> Bấm Hoàn tất', font: 'Segoe UI' })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '4. Xuất báo cáo nhật ký ra Excel', font: 'Segoe UI' })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Lịch tác nghiệp -> Xuất báo cáo', font: 'Segoe UI' })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '2 Chạm: Chọn ngày -> Bấm Tải file Excel', font: 'Segoe UI' })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '5. Cắt lá nha đam tươi', font: 'Segoe UI' })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Trang chủ -> Thu hoạch', font: 'Segoe UI' })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Gõ số kg lá -> Bấm Lưu (tự cộng vào kho bán)', font: 'Segoe UI' })] })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '6. Mua Mật rỉ / Phân bón mới về', font: 'Segoe UI' })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Kho & Chế biến -> Nhập hàng mới', font: 'Segoe UI' })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Điền Số lượng + Tổng tiền đã trả -> Bấm Xác nhận', font: 'Segoe UI' })] })] })
                ]
              })
            ]
          })
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join('d:\\Nha đam mỹ', 'HUONG_DAN_SU_DUNG_APP_VUON_NHA_DAM.docx');
  fs.writeFileSync(outPath, buffer);
  console.log('Document created successfully at:', outPath);
}

generateManualDocx().catch(console.error);
