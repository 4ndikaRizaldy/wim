var data = [];
var jabatanArray = [
    "Founder",
    "CO-Founder",
    "Asisten Founder",
    "Leader Admin",
    "Admin Sekretaris",
    "Admin Sosmed",
    "Admin Materi",
    "Admin Materi Psikologi",
    "Admin BK",
    "Admin Grafis",
    "Admin Game",
    "Admin Kritsar",
    "Admin Anggota Akhir",
    "Admin Pengelolaan Grup Promosi WIM",
    "Admin Moderator"
];

function bukaDatabase() {
    var request = indexedDB.open("MyDatabase", 1);

    request.onerror = function (event) {
        console.log("Error opening database");
    };

    request.onupgradeneeded = function (event) {
        var db = event.target.result;

        var objectStore = db.createObjectStore("myData", { keyPath: "id", autoIncrement: true });

        objectStore.createIndex("namaLengkap", "namaLengkap", { unique: false });
    };

    return request;
}

function tambahDataIndexedDB(data) {
    var request = bukaDatabase();

    request.onsuccess = function (event) {
        var db = event.target.result;

        var transaction = db.transaction(["myData"], "readwrite");
        var objectStore = transaction.objectStore("myData");

        var requestTambah = objectStore.add(data);

        requestTambah.onsuccess = function () {
            console.log("Data berhasil ditambahkan");
        };

        requestTambah.onerror = function () {
            console.log("Gagal menambahkan data");
        };
    };
}

function tampilDataIndexedDB() {
    var request = bukaDatabase();

    request.onsuccess = function (event) {
        var db = event.target.result;

        var transaction = db.transaction(["myData"]);
        var objectStore = transaction.objectStore("myData");
        var requestGetAll = objectStore.getAll();

        requestGetAll.onsuccess = function (event) {
            data = event.target.result || [];
            tampil();
        };

        requestGetAll.onerror = function () {
            console.log("Gagal mendapatkan data dari IndexedDB");
        };
    };
}

function tampil() {
    var tabel = document.getElementById("tabel");
    tabel.innerHTML = "<thead class='thead-light'><tr><th scope='col'>No</th><th scope='col'>Nama Lengkap</th><th scope='col'>Nama Panggilan</th><th scope='col'>Tanggal Lahir</th><th scope='col'>Jabatan</th><th scope='col'>Foto</th><th scope='col'>Action</th></tr></thead><tbody>";

    for (let i = 0; i < data.length; i++) {
        var btnEdit = "<button class='btn btn-warning' onclick='edit(" + i + ")'>Edit</button>";
        var btnHapus = "<button class='btn btn-danger' onclick='hapus(" + i + ")'>Hapus</button>";
        var btnDownload = "<a href='" + data[i].foto + "' download='foto_" + i + ".png'><button class='btn btn-info'>Download</button></a>";

        tabel.innerHTML += "<tr><th scope='row'>" + (i + 1) + "</th><td>" + data[i].namaLengkap + "</td><td>" + data[i].namaPanggilan + "</td><td>" + data[i].tanggalLahir + "</td><td>" + data[i].jabatan + "</td><td><img src='" + data[i].foto + "' alt='Foto' style='max-width: 100px;'></td><td>" + btnEdit + " " + btnHapus + " " + btnDownload + "</td></tr>";
    }

    tabel.innerHTML += "</tbody>";
}



function tambah() {
    var inputNamaLengkap = document.querySelector("input[name=nlengkap]").value;
    var inputNamaPanggilan = document.querySelector("input[name=npanggil]").value;
    var inputTanggalLahir = document.querySelector("input[name=tgllahir]").value;
    var inputJabatan = document.querySelector("select[name=jabatan]").value;
    var inputFoto = document.querySelector("input[name=foto]").files[0];

    var reader = new FileReader();
    reader.onload = function (e) {
        var fotoUrl = e.target.result;

        data.push({
            "namaLengkap": inputNamaLengkap,
            "namaPanggilan": inputNamaPanggilan,
            "tanggalLahir": inputTanggalLahir,
            "jabatan": jabatanArray[inputJabatan - 1], // Mengambil nama jabatan berdasarkan indeks
            "foto": fotoUrl
        });

        // Simpan data ke localStorage
        localStorage.setItem('myData', JSON.stringify(data));

        // Tampilkan data
        tampil();

        // Bersihkan formulir setelah ditambahkan
        document.getElementById("formulir").reset();
    };

    reader.readAsDataURL(inputFoto);
}

function edit(id) {
    var baru = prompt("Edit", "Nama Lengkap: " + data[id].namaLengkap + "\nNama Panggilan: " + data[id].namaPanggilan + "\nTanggal Lahir: " + data[id].tanggalLahir + "\nJabatan: " + data[id].jabatan);
    if (baru) {
        var arrBaru = baru.split("\n");
        var namaLengkapBaru = arrBaru[0].substring(arrBaru[0].indexOf(":") + 2);
        var namaPanggilanBaru = arrBaru[1].substring(arrBaru[1].indexOf(":") + 2);
        var tanggalLahirBaru = arrBaru[2].substring(arrBaru[2].indexOf(":") + 2);
        var jabatanBaru = arrBaru[3].substring(arrBaru[3].indexOf(":") + 2);

        data[id].namaLengkap = namaLengkapBaru;
        data[id].namaPanggilan = namaPanggilanBaru;
        data[id].tanggalLahir = tanggalLahirBaru;
        data[id].jabatan = jabatanBaru;

        // Update data di localStorage
        localStorage.setItem('myData', JSON.stringify(data));

        // Update data di IndexedDB
        var request = bukaDatabase();

        request.onsuccess = function (event) {
            var db = event.target.result;

            var transaction = db.transaction(["myData"], "readwrite");
            var objectStore = transaction.objectStore("myData");
            var requestUbah = objectStore.put(data[id]);

            requestUbah.onsuccess = function () {
                console.log("Data di IndexedDB berhasil diubah");
            };

            requestUbah.onerror = function () {
                console.log("Gagal mengubah data di IndexedDB");
            };
        };

        // Tampilkan perubahan
        tampil();
    }
}


function hapus(id) {
    data.splice(id, 1);

    // Update data di localStorage
    localStorage.setItem('myData', JSON.stringify(data));

    // Hapus data di IndexedDB
    var request = bukaDatabase();

    request.onsuccess = function (event) {
        var db = event.target.result;

        var transaction = db.transaction(["myData"], "readwrite");
        var objectStore = transaction.objectStore("myData");
        var requestHapus = objectStore.delete(data[id].id);

        requestHapus.onsuccess = function () {
            console.log("Data di IndexedDB berhasil dihapus");
        };

        requestHapus.onerror = function () {
            console.log("Gagal menghapus data di IndexedDB");
        };
    };

    // Tampilkan perubahan
    tampil();
}

// Memanggil fungsi untuk mendapatkan data dari IndexedDB
tampilDataIndexedDB();