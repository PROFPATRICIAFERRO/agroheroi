// Variáveis globais do jogo
let nomeJogador = "";
let personagemEscolhido = "";
let floresColetadas = 0;
let jogoAbelhaAtivo = false;
let abelhaX = 100, abelhaY = 200;
let florX, florY;
let animacaoId;
let fogoY, fumaçaY;
let canvas, ctx;
let setaCimaPressionada = false, setaBaixoPressionada = false;
let pontosCompostagem = 0;
let itensCompostagem = [];
let itensProcessados = 0;
let acertosCompostagem = 0;
let plantioConcluido = false;
let mudasPlantadas = { tomate: false, alface: false, milho: false };

// Lista de materiais compostagem
const materiaisComp = [
    { nome: "🍌 Casca de banana", tipo: "organico", valor: 10 },
    { nome: "🍎 Casca de maçã", tipo: "organico", valor: 10 },
    { nome: "🍂 Folhas secas", tipo: "organico", valor: 10 },
    { nome: "🥬 Restos de verduras", tipo: "organico", valor: 10 },
    { nome: "🥫 Lata", tipo: "rejeito", valor: -5 },
    { nome: "🧴 Plástico", tipo: "rejeito", valor: -5 },
    { nome: "🔋 Pilha", tipo: "rejeito", valor: -5 }
];

// Aguarda DOM carregado
document.addEventListener("DOMContentLoaded", () => {
    // Elementos gerais
    const fases = document.querySelectorAll(".fase");
    function showFase(id) {
        fases.forEach(f => f.classList.remove("active"));
        document.getElementById(id).classList.add("active");
    }

    // Controles de acessibilidade
    let fontSize = 100;
    const aumentarFonte = document.getElementById("fontIncreaseBtn");
    const diminuirFonte = document.getElementById("fontDecreaseBtn");
    const darkToggle = document.getElementById("darkModeToggle");
    const appContainer = document.getElementById("appContainer");

    aumentarFonte.addEventListener("click", () => {
        if (fontSize < 130) {
            fontSize += 10;
            document.body.style.fontSize = fontSize + "%";
        }
    });
    diminuirFonte.addEventListener("click", () => {
        if (fontSize > 70) {
            fontSize -= 10;
            document.body.style.fontSize = fontSize + "%";
        }
    });
    darkToggle.addEventListener("click", () => {
        appContainer.classList.toggle("dark-mode");
        darkToggle.textContent = appContainer.classList.contains("dark-mode") ? "☀️" : "🌙";
    });

    // FASE 0 - nome
    const confirmarNome = document.getElementById("confirmarNome");
    const inputNome = document.getElementById("nomeJogador");
    confirmarNome.addEventListener("click", () => {
        if (inputNome.value.trim() === "") {
            alert("Por favor, digite seu nome!");
            return;
        }
        nomeJogador = inputNome.value.trim();
        // Atualizar todos os lugares com nome
        document.querySelectorAll(".nome-destaque").forEach(el => el.textContent = nomeJogador);
        showFase("fase1");
    });

    // FASE 1 - escolha personagem
    const botoesEscolher = document.querySelectorAll(".btn-escolher");
    botoesEscolher.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const card = btn.closest(".card-personagem");
            if (card.dataset.personagem === "menino") personagemEscolhido = "👦 Lucas";
            else personagemEscolhido = "👧 Sofia";
            // Mostrar fase 2 (explicação abelhas)
            showFase("fase2");
            // texto fala atualizada
            const falaFase2 = document.querySelector("#fase2 .fala p:first-child");
            if (falaFase2) falaFase2.innerHTML = `${nomeJogador}, você escolheu ${personagemEscolhido}! Agora vamos proteger os polinizadores.`;
        });
    });

    // Iniciar jogo abelha (fase2 -> fase3)
    const iniciarJogoAbelha = document.getElementById("iniciarJogoAbelha");
    iniciarJogoAbelha.addEventListener("click", () => {
        showFase("fase3");
        iniciarMiniGameAbelha();
    });

    // Função do jogo abelha
    function iniciarMiniGameAbelha() {
        if (animacaoId) cancelAnimationFrame(animacaoId);
        canvas = document.getElementById("gameCanvas");
        ctx = canvas.getContext("2d");
        floresColetadas = 0;
        document.getElementById("floresColetadas").innerText = floresColetadas;
        abelhaX = 80;
        abelhaY = canvas.height / 2;
        florX = Math.random() * (canvas.width - 40) + 20;
        florY = Math.random() * (canvas.height - 40) + 20;
        fogoY = canvas.height - 30;
        fumaçaY = 30;
        jogoAbelhaAtivo = true;

        window.addEventListener("keydown", keyHandler);
        window.addEventListener("keyup", keyUpHandler);
        function keyHandler(e) {
            if (e.key === "ArrowUp") { setaCimaPressionada = true; e.preventDefault(); }
            if (e.key === "ArrowDown") { setaBaixoPressionada = true; e.preventDefault(); }
        }
        function keyUpHandler(e) {
            if (e.key === "ArrowUp") setaCimaPressionada = false;
            if (e.key === "ArrowDown") setaBaixoPressionada = false;
        }

        function atualizar() {
            if (!jogoAbelhaAtivo) return;
            // Movimento abelha
            if (setaCimaPressionada && abelhaY > 20) abelhaY -= 5;
            if (setaBaixoPressionada && abelhaY < canvas.height - 30) abelhaY += 5;

            // Colisão com fogo ou fumaça
            if ((abelhaY + 20 > fogoY && abelhaY - 20 < fogoY + 20) ||
                (abelhaY + 20 > fumaçaY - 10 && abelhaY - 20 < fumaçaY + 20)) {
                alert("Você colidiu com fogo/fumaça! Recomeçando a missão...");
                resetJogoAbelha();
                return;
            }

            // Colisão com flor
            const dist = Math.hypot(abelhaX - florX, abelhaY - florY);
            if (dist < 30) {
                floresColetadas++;
                document.getElementById("floresColetadas").innerText = floresColetadas;
                if (floresColetadas >= 10) {
                    finalizarJogoAbelha(true);
                    return;
                }
                reposicionarFlor();
            }
            desenharCenario();
            animacaoId = requestAnimationFrame(atualizar);
        }

        function reposicionarFlor() {
            florX = Math.random() * (canvas.width - 50) + 25;
            florY = Math.random() * (canvas.height - 50) + 25;
        }

        function desenharCenario() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // céu, fogo (baixo), fumaça (cima)
            ctx.fillStyle = "#ff8a65";
            ctx.fillRect(0, fogoY, canvas.width, 30);
            ctx.fillStyle = "#b0bec5";
            ctx.fillRect(0, fumaçaY - 20, canvas.width, 35);
            ctx.fillStyle = "#ffd54f";
            ctx.beginPath();
            ctx.arc(florX, florY, 12, 0, 2 * Math.PI);
            ctx.fill();
            // abelha
            ctx.fillStyle = "#fbc02d";
            ctx.beginPath();
            ctx.ellipse(abelhaX, abelhaY, 12, 9, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = "black";
            ctx.fillRect(abelhaX + 8, abelhaY - 3, 8, 3);
        }

        function resetJogoAbelha() {
            floresColetadas = 0;
            document.getElementById("floresColetadas").innerText = 0;
            abelhaY = canvas.height / 2;
            reposicionarFlor();
        }
        function finalizarJogoAbelha(vencido) {
            if (vencido) {
                jogoAbelhaAtivo = false;
                window.removeEventListener("keydown", keyHandler);
                window.removeEventListener("keyup", keyUpHandler);
                cancelAnimationFrame(animacaoId);
                // Fase 4 de conquista
                document.getElementById("msgParabensAbelha").innerHTML = `Muito bem, ${nomeJogador}!<br>Você ajudou a proteger os polinizadores.<br>Graças às abelhas, muitas culturas agrícolas conseguem produzir alimentos.<br>Quando protegemos os polinizadores, fortalecemos toda a cadeia alimentar.`;
                showFase("fase4");
            }
        }

        desenharCenario();
        atualizar();
    }

    // Reiniciar jogo abelha manual
    const reiniciarAbelha = document.getElementById("reiniciarAbelha");
    if (reiniciarAbelha) reiniciarAbelha.addEventListener("click", () => {
        if (animacaoId) cancelAnimationFrame(animacaoId);
        iniciarMiniGameAbelha();
    });

    // Prox compostagem
    document.getElementById("proxCompostagem")?.addEventListener("click", () => {
        showFase("fase5");
        document.getElementById("falaCompostagem").innerHTML = `${nomeJogador}, agora vamos aprender sobre compostagem.<br>Nem todo lixo precisa ser descartado.<br>Restos de frutas, verduras e folhas podem virar adubo natural.<br>A compostagem reduz a quantidade de resíduos e melhora a qualidade do solo.<br>Vamos separar corretamente os materiais.`;
    });
    document.getElementById("iniciarCompostagem")?.addEventListener("click", () => {
        carregarJogoCompostagem();
        showFase("fase6");
    });

    function carregarJogoCompostagem() {
        const materiaisDiv = document.getElementById("materiaisLista");
        materiaisDiv.innerHTML = "";
        pontosCompostagem = 0;
        itensProcessados = 0;
        acertosCompostagem = 0;
        document.getElementById("pontosCompostagem").innerText = pontosCompostagem;
        document.getElementById("itensComposteira").innerHTML = "";
        document.getElementById("finalizarCompostagem").disabled = true;
        itensCompostagem = [...materiaisComp];

        itensCompostagem.forEach((item, idx) => {
            const itemEl = document.createElement("div");
            itemEl.className = "item-material";
            itemEl.setAttribute("draggable", "true");
            itemEl.setAttribute("data-idx", idx);
            itemEl.setAttribute("data-tipo", item.tipo);
            itemEl.setAttribute("data-valor", item.valor);
            itemEl.textContent = item.nome;
            itemEl.addEventListener("dragstart", handleDragStart);
            itemEl.addEventListener("dragend", handleDragEnd);
            materiaisDiv.appendChild(itemEl);
        });

        const composteira = document.getElementById("composteiraDrop");
        composteira.addEventListener("dragover", (e) => e.preventDefault());
        composteira.addEventListener("drop", handleDropCompostagem);
    }

    let itemDragAtual = null;
    function handleDragStart(e) {
        itemDragAtual = e.target;
        e.dataTransfer.setData("text/plain", e.target.getAttribute("data-idx"));
    }
    function handleDragEnd() { itemDragAtual = null; }

    function handleDropCompostagem(e) {
        e.preventDefault();
        if (!itemDragAtual) return;
        const idx = itemDragAtual.getAttribute("data-idx");
        const item = itensCompostagem[idx];
        if (!item) return;
        const valor = item.valor;
        pontosCompostagem += valor;
        document.getElementById("pontosCompostagem").innerText = pontosCompostagem;
        if (valor > 0) acertosCompostagem++;
        itensProcessados++;
        const itemText = item.nome;
        const listaIten = document.getElementById("itensComposteira");
        const novoItem = document.createElement("div");
        novoItem.textContent = itemText + (valor > 0 ? " ✔️" : " ❌");
        listaIten.appendChild(novoItem);
        itemDragAtual.remove();
        itensCompostagem[idx] = null;

        if (itensProcessados === materiaisComp.length) {
            document.getElementById("feedbackCompostagem").innerHTML = `Compostagem finalizada! Acertos: ${acertosCompostagem}. Pontuação final: ${pontosCompostagem}`;
            document.getElementById("finalizarCompostagem").disabled = false;
        }
    }

    document.getElementById("finalizarCompostagem")?.addEventListener("click", () => {
        showFase("fase7");
        document.getElementById("msgMestreCompost").innerHTML = `Excelente trabalho, ${nomeJogador}!<br>Você transformou resíduos orgânicos em adubo natural.<br>Esse adubo ajuda as plantas a crescerem de forma saudável.<br>Assim produzimos alimentos sem prejudicar o meio ambiente.`;
    });

    document.getElementById("proxPlantio")?.addEventListener("click", () => {
        showFase("fase8");
        document.getElementById("falaPlantio").innerHTML = `${nomeJogador}, graças às abelhas e à compostagem, agora podemos produzir alimentos de forma sustentável.<br>Os polinizadores ajudaram as plantas.<br>O adubo natural fortaleceu o solo.<br>Agora chegou o momento de plantar.<br>Vamos ajudar o campo a crescer.`;
    });

    document.getElementById("iniciarPlantio")?.addEventListener("click", () => {
        configurarPlantio();
        showFase("fase9");
    });

    function configurarPlantio() {
        mudasPlantadas = { tomate: false, alface: false, milho: false };
        const mudas = document.querySelectorAll(".muda");
        const canteiros = document.querySelectorAll(".canteiro");
        mudas.forEach(muda => {
            muda.addEventListener("dragstart", (e) => {
                e.dataTransfer.setData("text/plain", muda.dataset.tipo);
            });
        });
        canteiros.forEach(canteiro => {
            canteiro.addEventListener("dragover", (e) => e.preventDefault());
            canteiro.addEventListener("drop", (e) => {
                e.preventDefault();
                const tipo = e.dataTransfer.getData("text/plain");
                const culturaCanteiro = canteiro.dataset.cultura;
                if (tipo === culturaCanteiro && !mudasPlantadas[tipo]) {
                    mudasPlantadas[tipo] = true;
                    canteiro.querySelector(".planta-emoji").innerHTML = "🌱";
                    document.getElementById("feedbackPlantio").innerHTML = `Muda de ${tipo} plantada!`;
                } else {
                    document.getElementById("feedbackPlantio").innerHTML = "Local incorreto ou já plantado!";
                }
                if (mudasPlantadas.tomate && mudasPlantadas.alface && mudasPlantadas.milho) {
                    document.getElementById("finalizarPlantio").disabled = false;
                }
            });
        });
        document.getElementById("finalizarPlantio").disabled = true;
        document.getElementById("regarPlantas").disabled = false;
    }

    document.getElementById("regarPlantas")?.addEventListener("click", () => {
        if (mudasPlantadas.tomate && mudasPlantadas.alface && mudasPlantadas.milho) {
            const plantas = document.querySelectorAll(".planta-emoji");
            let etapas = ["🌱", "🌿", "🍅", "🥬", "🌽"];
            let index = 0;
            const intervalo = setInterval(() => {
                if (index < etapas.length) {
                    plantas.forEach(p => {
                        if (p.parentElement.dataset.cultura === "tomate" && etapas[index] === "🍅") p.innerHTML = "🍅";
                        else if (p.parentElement.dataset.cultura === "alface" && etapas[index] === "🥬") p.innerHTML = "🥬";
                        else if (p.parentElement.dataset.cultura === "milho" && etapas[index] === "🌽") p.innerHTML = "🌽";
                        else if (index < 2) p.innerHTML = etapas[index];
                        else if (index === 2 && p.parentElement.dataset.cultura === "tomate") p.innerHTML = "🍅";
                        else if (index === 3 && p.parentElement.dataset.cultura === "alface") p.innerHTML = "🥬";
                        else if (index === 4 && p.parentElement.dataset.cultura === "milho") p.innerHTML = "🌽";
                    });
                    index++;
                } else {
                    clearInterval(intervalo);
                    document.getElementById("feedbackPlantio").innerHTML = "🌻 Plantas crescidas! Missão concluída!";
                    document.getElementById("finalizarPlantio").disabled = false;
                }
            }, 800);
            document.getElementById("regarPlantas").disabled = true;
        } else {
            alert("Plante todas as mudas primeiro!");
        }
    });

    document.getElementById("finalizarPlantio")?.addEventListener("click", () => {
        showFase("fase10");
        document.getElementById("msgAgricultor").innerHTML = `Parabéns, ${nomeJogador}!<br>Você ajudou a proteger os polinizadores.<br>Produziu adubo natural.<br>E cultivou alimentos de forma sustentável.<br>Esse é o caminho para um Agro Forte e um Futuro Sustentável.`;
    });

    document.getElementById("proxQuiz")?.addEventListener("click", () => {
        showFase("fase11");
    });

    document.getElementById("verificarQuiz")?.addEventListener("click", () => {
        const q1 = document.querySelector('input[name="q1"]:checked');
        const q2 = document.querySelector('input[name="q2"]:checked');
        const q3 = document.querySelector('input[name="q3"]:checked');
        let acertos = 0;
        if (q1 && q1.value === "b") acertos++;
        if (q2 && q2.value === "c") acertos++;
        if (q3 && q3.value === "c") acertos++;
        if (acertos === 3) {
            document.getElementById("feedbackQuiz").innerHTML = "Excelente! Você aprendeu os principais conceitos do Agro Forte.";
            document.getElementById("proxCertificado").style.display = "inline-block";
            document.getElementById("proxCertificado").disabled = false;
        } else {
            document.getElementById("feedbackQuiz").innerHTML = `Você acertou ${acertos} de 3. Tente novamente!`;
        }
    });

    document.getElementById("proxCertificado")?.addEventListener("click", () => {
        document.getElementById("certNome").innerText = nomeJogador;
        const hoje = new Date();
        const dataFormatada = hoje.toLocaleDateString("pt-BR");
        document.getElementById("dataCertificado").innerText = dataFormatada;
        showFase("fase12");
    });

    document.getElementById("reiniciarJogo")?.addEventListener("click", () => {
        location.reload();
    });
});
