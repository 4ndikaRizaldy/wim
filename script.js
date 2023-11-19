var data = [];

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
    tabel.innerHTML = "<tr><th>No</th><th>Nama Lengkap</th><th>Nama Panggilan</th><th>Tanggal Lahir</th><th>Foto</th><th>Action</th></tr>";

    for (let i = 0; i < data.length; i++) {
        var btnEdit = "<button class='btn-edit' href='#' onclick='edit(" + i + ")'>Edit</button>";
        var btnHapus = "<button class='btn-hapus' href='#' onclick='hapus(" + i + ")'>Hapus</button>";
        var btnDownload = "<a href='" + data[i].foto + "' download='foto_" + i + ".png'><button class='btn-download'>Download</button></a>";
        j = i + 1;

        tabel.innerHTML += "<tr><td>" + j + "</td><td>" + data[i].namaLengkap + "</td><td>" + data[i].namaPanggilan + "</td><td>" + data[i].tanggalLahir + "</td><td><img src='" + data[i].foto + "' alt='Foto'></td><td>" + btnEdit + " " + btnHapus + " " + btnDownload + "</tr>";
    }
}


function tambah() {
    var inputNamaLengkap = document.querySelector("input[name=nlengkap]");
    var inputNamaPanggilan = document.querySelector("input[name=npanggil]");
    var inputTanggalLahir = document.querySelector("input[name=tgllahir]");
    var inputFoto = document.querySelector("input[name=foto]");

    var namaLengkap = inputNamaLengkap.value;
    var namaPanggilan = inputNamaPanggilan.value;
    var tanggalLahir = inputTanggalLahir.value;
    var foto = inputFoto.files[0];

    var reader = new FileReader();
    reader.onload = function (e) {
        var fotoUrl = e.target.result;

        data.push({
            "namaLengkap": namaLengkap,
            "namaPanggilan": namaPanggilan,
            "tanggalLahir": tanggalLahir,
            "foto": fotoUrl
        });

        localStorage.setItem('myData', JSON.stringify(data));
        tambahDataIndexedDB({
            "namaLengkap": namaLengkap,
            "namaPanggilan": namaPanggilan,
            "tanggalLahir": tanggalLahir,
            "foto": fotoUrl
        });

        tampil();

        inputNamaLengkap.value = "";
        inputNamaPanggilan.value = "";
        inputTanggalLahir.value = "";
        inputFoto.value = "";
    };

    reader.readAsDataURL(foto);
}

function edit(id) {
    var baru = prompt("Edit", "Nama Lengkap: " + data[id].namaLengkap + "\nNama Panggilan: " + data[id].namaPanggilan + "\\nTanggal Lahir: " + data[id].tanggalLahir);
    if (baru) {
        var arrBaru = baru.split("\n");
        var namaLengkapBaru = arrBaru[0].substring(arrBaru[0].indexOf(":") + 2);
        var namaPanggilanBaru = arrBaru[1].substring(arrBaru[1].indexOf(":") + 2);
        var tanggalLahirBaru = arrBaru[2].substring(arrBaru[2].indexOf(":") + 2);

        data[id].namaLengkap = namaLengkapBaru;
        data[id].namaPanggilan = namaPanggilanBaru;
        data[id].tanggalLahir = tanggalLahirBaru;

        // Update data di localStorage
        localStorage.setItem('myData', JSON.stringify(data));

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
        var requestHapus = objectStore.delete(id + 1); // Karena id di IndexedDB dimulai dari 1

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