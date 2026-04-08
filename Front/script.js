document.addEventListener("DOMContentLoaded", function () {

    let vehicles = [];
    let totalCO2 = 0;

    const form = document.getElementById("vehicleForm");
    const list = document.getElementById("vehicleList");
    const totalDisplay = document.getElementById("totalCO2");

    form.addEventListener("submit", function(e) {
        e.preventDefault();

        const vehicle = {
            id: Date.now(),
            name: document.getElementById("name").value,
            category: document.getElementById("category").value,
            fuel: document.getElementById("fuel").value
        };

        vehicles.push(vehicle);
        renderList();
        form.reset();
    });

    function renderList() {
        list.innerHTML = "";

        vehicles.forEach(v => {
            const li = document.createElement("li");
            li.innerHTML = `
                ${v.name} (${v.category} - ${v.fuel})
                <button onclick="removeVehicle(${v.id})">Remover</button>
            `;
            list.appendChild(li);
        });
    }

    window.removeVehicle = function(id) {
        vehicles = vehicles.filter(v => v.id !== id);
        renderList();
    };

    window.simular = function () {
        const input = document.getElementById("pedagios");
        let pedagios = parseInt(input.value);

        if (isNaN(pedagios) || pedagios <= 0) {
            document.getElementById("resultado").innerText =
                "Digite um número válido maior que 0.";
            return;
        }

        const co2Extra = pedagios * 0.02;

        document.getElementById("resultado").innerText =
            `🌱 Você evitaria ${co2Extra.toFixed(2)} kg de CO₂`;

        totalCO2 = Math.max(0, totalCO2 + co2Extra);
        totalDisplay.innerText = totalCO2.toFixed(2) + " kg";

        input.value = "";
    };

    document.getElementById("pedagios").addEventListener("input", function () {
        if (this.value < 0) this.value = 0;
    });

});