# Introduction

This is an API written in TypeScript with NestJS framework for communicating with IoT devices (ESP32) in order to take the data from the sensors (such as light sensor, humidity sensor,...), save it, and make reports. This API also supports controlling some output IoT devices by utilizing MQTT protocol and Eclipse Mosquitto Broker.

# Compile and run the project

```
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

Topic chung: **`garden/control`**

---

### 1. 💧 Hệ thống Nước (Bơm)

**A. Bật Bơm Tưới Cây (Water Pump - Relay 1)**
Lệnh này sẽ bật bơm ở chân GPIO 26 trong 5 giây (5000ms) rồi tự tắt.

```bash
docker exec -it broker mosquitto_pub -t "garden/control" -m '{"action": "WATER", "duration": 5000}'

```

**B. Bật Bơm Cấp Nước (Refill Pump - Relay 2)**
Lệnh này bật bơm ở chân GPIO 27 để bơm nước từ nguồn ngoài vào bình chứa trong 4 giây.

```bash
docker exec -it broker mosquitto_pub -t "garden/control" -m '{"action": "REFILL", "duration": 4000}'

```

---

### 2. ☂️ Hệ thống Mái che (Servo)

**A. MỞ Mái che (Trời nắng đẹp)**
Lệnh này quay Servo về góc mở (thường là 0 hoặc 15 độ tùy code bạn chỉnh).

```bash
docker exec -it broker mosquitto_pub -t "garden/control" -m '{"action": "AWNING", "open": true}'

```

**B. ĐÓNG Mái che (Trời mưa/Tối)**
Lệnh này quay Servo về góc đóng (thường là 180 hoặc 165 độ).

```bash
docker exec -it broker mosquitto_pub -t "garden/control" -m '{"action": "AWNING", "open": false}'

```

---

### 3. ⚙️ Chuyển Chế độ (Manual/Auto)

_Nếu firmware của bạn có logic tự động tưới, bạn cần chuyển sang chế độ Manual để test lệnh tay (đề phòng logic tự động nó ghi đè lệnh của bạn)._

**Chuyển sang Chế độ Thủ công (Manual):**

```bash
docker exec -it broker mosquitto_pub -t "garden/control" -m '{"action": "SET_MODE", "mode": "MANUAL"}'

```

**Chuyển sang Chế độ Tự động (Auto):**

```bash
docker exec -it broker mosquitto_pub -t "garden/control" -m '{"action": "SET_MODE", "mode": "AUTO"}'

```

---

### 💡 Lưu ý quan trọng về dấu nháy (Quotes)

Nếu bạn chạy lệnh trên **Windows PowerShell**, cú pháp JSON `'{"key": "value"}'` thường bị lỗi. Bạn cần đổi sang cú pháp escaped của Windows:

_Ví dụ chạy trên PowerShell:_

```powershell
# Chú ý dấu nháy kép bao quanh và dấu backslash trước dấu nháy kép bên trong
docker exec -it broker mosquitto_pub -t "garden/control" -m "{\"action\": \"WATER\", \"duration\": 5000}"

```

Nhưng tốt nhất bạn cứ dùng **Terminal của WSL** (Ubuntu) để copy paste mấy lệnh ở trên cho nhanh và chuẩn nhé! Chúc bạn test thành công! 🚀
