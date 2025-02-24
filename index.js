async function fetchData() {
	try {
		const response = await fetch("https://raw.githubusercontent.com/DevYuriOliveira73/jsonPrefeituraQuixada/refs/heads/main/prefeituraQuixada.json");
		const json = await response.json();
		console.log("JSON carregado:", json);
  
		const dados = json.data || json;
		if (!Array.isArray(dados)) {
			throw new Error("Os dados carregados não são uma lista.");
		}
  
		const resultado = dados
			.map((funcionario, indice, array) => {
				if (indice === array.length - 1) return null; // Ignora o último elemento
				const valorAmericanoBruto = parseFloat(funcionario["Proventos"].toString().padEnd(2, "0")) * 1000;
				const valorAmericanoLiquido = parseFloat(funcionario["Líquido"].toString().padEnd(2, "0"));
				return {
					funcionario: funcionario["Nome do funcionário"],
					cargo: funcionario["Cargo"].split(' ').slice(2).join(' '),
					setor: funcionario["Setor"],
					matricula: funcionario["Matricula"],
					bruto: valorAmericanoBruto,
					liquido: valorAmericanoLiquido,
				};
			})
			.filter(item => item !== null);
		return resultado;
	} catch (error) {
		console.error("Erro ao carregar o arquivo:", error);
		return [];
	}
}
  
function ordenacao(valor, array) {
	if (valor === "cargo") {
		return array.sort((a, b) => a.cargo.localeCompare(b.cargo));
	}
	if (valor === "menorSalario") {
		return array.sort((a, b) => a.liquido - b.liquido);
	}
	if (valor === "maiorSalario") {
		return array.sort((a, b) => b.liquido - a.liquido);
	}
	if (valor === "alfabetica") {
		return array.sort((a, b) => a.funcionario.localeCompare(b.funcionario));
	}
	return array;
}
  
function renderizarTabela(funcionarios) {
	const divFuncionario = document.querySelector("#corpo");
	if (!divFuncionario) {
		alert("Elemento #corpo não encontrado.");
		return;
	}
	if (!funcionarios.length) {
		divFuncionario.innerHTML = "<tr><td colspan='7'>Nenhum dado disponível.</td></tr>";
		return;
	}
	const listaHTML = funcionarios
		.map(({ funcionario, cargo, setor, matricula, bruto, liquido }) => {
			let valorBrBruto = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(bruto.toFixed(5));
			let valorBrLiquido = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(liquido.toFixed(2));
			const valorDescontado = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(bruto.toFixed(5) - liquido.toFixed(2));
			return (
				`<tr id="funcionario-${matricula}">
					<td>${funcionario}</td>
					<td>${cargo}</td>
					<td>${setor}</td>
					<td>${matricula}</td>
					<td>${valorBrBruto}</td>
					<td>${valorDescontado}</td>
					<td>${valorBrLiquido}</td>
				</tr>`
			);
		})
		.join("");
	divFuncionario.innerHTML = listaHTML;
}
  
function calcularMetricas(funcionarios) {
	if (!funcionarios.length) return {};
	// Calcula o desconto para cada funcionário
	funcionarios.forEach(f => { f.desconto = f.bruto - f.liquido; });
	const maxLiquido = Math.max(...funcionarios.map(f => f.liquido));
	const funcsMaiorSalario = funcionarios.filter(f => f.liquido === maxLiquido);
	const minLiquido = Math.min(...funcionarios.map(f => f.liquido));
	const funcsMenorSalario = funcionarios.filter(f => f.liquido === minLiquido);
	const maxDesconto = Math.max(...funcionarios.map(f => f.desconto));
	const funcsMaiorDesconto = funcionarios.filter(f => f.desconto === maxDesconto);
	const minDesconto = Math.min(...funcionarios.map(f => f.desconto));
	const funcsMenorDesconto = funcionarios.filter(f => f.desconto === minDesconto);
  
	// Calcula a porcentagem de desconto para cada funcionário
	funcionarios.forEach(f => { f.descontoPorcentagem = (f.desconto / f.bruto) * 100; });
	const maxDescontoPorcentagem = Math.max(...funcionarios.map(f => f.descontoPorcentagem));
	const funcsMaiorDescontoPorcentagem = funcionarios.filter(f => f.descontoPorcentagem === maxDescontoPorcentagem);
	const minDescontoPorcentagem = Math.min(...funcionarios.map(f => f.descontoPorcentagem));
	const funcsMenorDescontoPorcentagem = funcionarios.filter(f => f.descontoPorcentagem === minDescontoPorcentagem);
  
	const somaLiquidos = funcionarios.reduce((acc, f) => acc + f.liquido, 0).toFixed(2);
	const mediaSalarial = (funcionarios.reduce((acc, f) => acc + f.liquido, 0) / funcionarios.length).toFixed(2);
	const variancia = funcionarios.reduce((acc, f) => acc + Math.pow(f.liquido - mediaSalarial, 2), 0) / funcionarios.length;
	const desvioPadrao = Math.sqrt(variancia).toFixed(2);
  
	return {
		maiorSalarios: funcsMaiorSalario,
		menorSalarios: funcsMenorSalario,
		maiorDescontos: funcsMaiorDesconto,
		menorDescontos: funcsMenorDesconto,
		maiorDescontoPorcentagem: funcsMaiorDescontoPorcentagem,
		menorDescontoPorcentagem: funcsMenorDescontoPorcentagem,
		mediaSalarial,
		desvioPadrao,
		somaLiquidos
	};
}
  
function scrollToRow(id) {
	const target = document.getElementById(id);
	if (target) {
		target.scrollIntoView({ behavior: "smooth", block: "center" });
		target.classList.add("highlight");
		setTimeout(() => { target.classList.remove("highlight"); }, 2000);
	}
}
  
/* ---------- Funções para o dropdown comum dentro do card ---------- */
// Gera o HTML do <select> para o dropdown
function renderSelectDropdown(cardId, employees, selectedIndex) {
	if (employees.length < 2) return "";
	let html = `<div class="select-container">
      <select class="metric-select" onchange="updateCardContentFromSelect('${cardId}', this)">`;
	employees.forEach((emp, index) => {
		let parts = emp.funcionario.trim().split(" ");
		let nameReduced = parts[0] + (parts[1] ? " " + parts[1] : "");
		html += `<option value="${index}" ${index === selectedIndex ? "selected" : ""}>${nameReduced}</option>`;
	});
	html += `</select></div>`;
	return html;
}
  
// Atualiza o conteúdo do card com o funcionário selecionado via <select>
// Apenas altera o nome exibido; o valor permanece inalterado, pois é lido do atributo data-value.
function updateCardContentFromSelect(cardId, selectElem) {
	const index = parseInt(selectElem.value);
	let employees = window.metricEmployees && window.metricEmployees[cardId];
	if (!employees) return;
	let selected = employees[index];
	let partes = selected.funcionario.trim().split(" ");
	let displayName = partes[0] + (partes[1] ? " " + partes[1] : "");
	let cardElem = document.getElementById(cardId);
	let title = cardElem.getAttribute("data-title");
	let formattedValue = cardElem.getAttribute("data-value"); // Valor original
	cardElem.innerHTML = `
	  <div class="metrica-row metrica-title">${title}</div>
	  <div class="metrica-row metrica-name">${displayName} ${renderSelectDropdown(cardId, window.metricEmployees[cardId], index)}</div>
	  <div class="metrica-row metrica-value">${formattedValue}</div>`;
	cardElem.setAttribute("data-selected", index);
}
  
// Ao clicar no card (fora do <select>), realiza o scroll até o funcionário atualmente exibido
function cardClickHandler(event, cardId, title) {
	if (event.target.tagName.toLowerCase() === "select") return;
	let cardElem = document.getElementById(cardId);
	let selectedIndex = parseInt(cardElem.getAttribute("data-selected")) || 0;
	let employees = window.metricEmployees && window.metricEmployees[cardId];
	if (employees && employees.length > selectedIndex) {
		let emp = employees[selectedIndex];
		scrollToRow("funcionario-" + emp.matricula);
	}
}
  
/* ---------- Função auxiliar para renderizar cada card de métrica ---------- */
// Para cards clicáveis (com funcionário), renderiza 3 linhas:
// 1. Título da métrica  
// 2. Nome do funcionário (primeiro e segundo nome) seguido do dropdown <select> se houver mais de um  
// 3. Valor da métrica  
// Para métricas simples, renderiza 2 linhas: título e valor.
// Se o título contiver "%", formata o valor como percentual.
function renderMetricaCard(title, employees, value, clickable) {
	if (clickable && employees && employees.length > 0) {
		let cardId = "card-" + title.replace(/\s+/g, '-').toLowerCase();
		window.metricEmployees = window.metricEmployees || {};
		window.metricEmployees[cardId] = employees;
		// Seleciona o primeiro funcionário para exibição inicial
		let selected = employees[0];
		let partes = selected.funcionario.trim().split(" ");
		let displayName = partes[0] + (partes[1] ? " " + partes[1] : "");
		let formattedValue;
		if (title.indexOf("%") !== -1) {
			formattedValue = parseFloat(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 }) + "%";
		} else {
			formattedValue = "R$ " + parseFloat(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
		}
		// Armazena o valor formatado original em data-value para que não seja alterado
		let selectHTML = "";
		if (employees.length > 1) {
			selectHTML = renderSelectDropdown(cardId, employees, 0);
		}
		return `<div class="metrica-card clickable" id="${cardId}" data-title="${title}" data-selected="0" data-value="${formattedValue}" onclick="cardClickHandler(event, '${cardId}', '${title}')">
            <div class="metrica-row metrica-title">${title}</div>
            <div class="metrica-row metrica-name">${displayName} ${selectHTML}</div>
            <div class="metrica-row metrica-value">${formattedValue}</div>
        </div>`;
	} else {
		let formattedValue = "R$ " + parseFloat(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
		return `<div class="metrica-card simple">
            <div class="metrica-row metrica-title">${title}</div>
            <div class="metrica-row metrica-value">${formattedValue}</div>
        </div>`;
	}
}
  
function exibirMetricas(funcionarios) {
	const metricas = calcularMetricas(funcionarios);
	const divMetricas = document.getElementById("metricas");
	if (!divMetricas) {
		console.error("Elemento #metricas não encontrado.");
		return;
	}
	divMetricas.innerHTML = `
      <h2 class="metricas-header">Métricas</h2>
      <div class="metricas-container">
          ${renderMetricaCard("Maior Salário Líquido", metricas.maiorSalarios, metricas.maiorSalarios[0].liquido, true)}
          ${renderMetricaCard("Menor Salário Líquido", metricas.menorSalarios, metricas.menorSalarios[0].liquido, true)}
          ${renderMetricaCard("Maior Desconto", metricas.maiorDescontos, metricas.maiorDescontos[0].desconto, true)}
          ${renderMetricaCard("Menor Desconto", metricas.menorDescontos, metricas.menorDescontos[0].desconto, true)}
          ${renderMetricaCard("Maior Desconto %", metricas.maiorDescontoPorcentagem, metricas.maiorDescontoPorcentagem[0].descontoPorcentagem, true)}
          ${renderMetricaCard("Menor Desconto %", metricas.menorDescontoPorcentagem, metricas.menorDescontoPorcentagem[0].descontoPorcentagem, true)}
      </div>
      <div class="metricas-container simple-metrics">
          ${renderMetricaCard("Média Salarial", null, metricas.mediaSalarial, false)}
          ${renderMetricaCard("Desvio Padrão", null, metricas.desvioPadrao, false)}
          ${renderMetricaCard("Total da Folha", null, metricas.somaLiquidos, false)}
      </div>
	`;
}
  
function vamosRodarAutoBot(funcionarios) {
	const colunaDePesquisa = document.getElementById("filtragem").value;
	const valor_pesquisa = document.getElementById("pesquisar").value;
	const valorDeOrdenacao = document.getElementById("ordenacao").value;
	const botaoFiltragem = document.getElementById("limpaFiltro");
	let funcionariosFiltrados = funcionarios;
	if (valor_pesquisa.length) {
		botaoFiltragem.style.display = "flex";
		funcionariosFiltrados = funcionarios.filter((funcionario) => {
			return funcionario[colunaDePesquisa].includes(valor_pesquisa.toUpperCase());
		});
	}
	const funcionariosOrdenados = ordenacao(valorDeOrdenacao, funcionariosFiltrados);
	renderizarTabela(funcionariosOrdenados);
	exibirMetricas(funcionariosOrdenados);
}
  
function limparPesquisa() {
	const botaoFiltragem = document.getElementById("limpaFiltro");
	document.getElementById("filtragem").value = "";
	document.getElementById("pesquisar").value = "";
	botaoFiltragem.style.display = "none";
}
  
fetchData().then((dados) => {
	const botaoFiltragem = document.getElementById("limpaFiltro");
	const selectOrdenacao = document.getElementById("ordenacao");
	const inputDePesquisa = document.getElementById("pesquisar");
	const selectFiltragem = document.getElementById("filtragem");
	botaoFiltragem.addEventListener("click", () => vamosRodarAutoBot(dados));
	selectFiltragem.addEventListener("change", () => vamosRodarAutoBot(dados));
	selectOrdenacao.addEventListener("change", () => vamosRodarAutoBot(dados));
	inputDePesquisa.addEventListener("input", () => vamosRodarAutoBot(dados));
	renderizarTabela(dados);
	exibirMetricas(dados);
});
