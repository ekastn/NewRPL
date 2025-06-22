### Gaya CSS (MeetingManagement.css)

Berikut adalah contoh gaya CSS untuk tampilan di atas:

```css
/* filepath: src/styles/MeetingManagement.css */
.dashboard-main {
    display: flex;
}

.dashboard-content {
    flex: 1;
    padding: 20px;
}

.dashboard-header {
    margin-bottom: 20px;
}

.meeting-list {
    display: flex;
    flex-direction: column;
}

.meeting-card {
    background: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 15px;
    margin-bottom: 10px;
}

.meeting-actions {
    margin-top: 10px;
}

.btn-edit, .btn-delete {
    margin-right: 10px;
    padding: 5px 10px;
    border: none;
    border-radius: 3px;
    cursor: pointer;
}

.btn-edit {
    background-color: #4CAF50; /* Green */
    color: white;
}

.btn-delete {
    background-color: #f44336; /* Red */
    color: white;
}
```

### Penjelasan

1. **Komponen `MeetingManagement`**: Komponen ini mengambil data meeting dari API dan menampilkannya dalam bentuk kartu. Setiap kartu menampilkan judul meeting, tanggal, waktu, dan peserta.

2. **Gaya CSS**: Gaya dasar untuk tata letak dan tampilan kartu meeting. Anda dapat menyesuaikan gaya ini sesuai dengan desain yang Anda inginkan.

3. **Fungsi `getMeetings`**: Pastikan Anda memiliki fungsi ini di `meetingService.js` untuk mengambil data meeting dari backend.

Silakan sesuaikan kode ini dengan kebutuhan spesifik Anda dan desain yang Anda inginkan! Jika Anda memiliki gambar atau desain spesifik yang ingin diikuti, silakan berikan detail lebih lanjut.