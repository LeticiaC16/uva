async function abrirArquivo() {
    const matricula = obterMatricula();
    if (!matricula) {
        document.body.innerHTML = "<h2>Matrícula não informada!</h2>";
        return;
    }

    const pdfUrl = `https://uva-beryl.vercel.app/cartao_${matricula}.png`;
    const txtUrl = `https://uva-beryl.vercel.app/cartao_${matricula}.txt`;

    if (navigator.onLine) {
        // Redireciona para o PDF
        window.location.href = pdfUrl;

        // Baixa e armazena o TXT no localStorage para acesso offline
        try {
            const response = await fetch(txtUrl);
            if (response.ok) {
                const texto = await response.text();
                localStorage.setItem(`cartao_${matricula}_txt`, texto); // Armazenando no localStorage
                console.log(`TXT salvo no localStorage para a matrícula ${matricula}`);
            } else {
                console.error("Erro ao baixar o TXT.");
            }
        } catch (error) {
            console.error("Erro ao armazenar o TXT:", error);
        }
    } else {
        // Se estiver offline, tenta carregar o arquivo .txt do localStorage
        const textoOffline = localStorage.getItem(`cartao_${matricula}_txt`);
        if (textoOffline) {
            document.body.innerHTML = `
                <h2>Você está offline</h2>
                <p><strong>Conteúdo salvo para a matrícula ${matricula}:</strong></p>
                <pre>${textoOffline}</pre>
            `;
        } else {
            document.body.innerHTML = `
                <h2>Você está offline</h2>
                <p><strong>Arquivo offline não encontrado para a matrícula ${matricula}.</strong></p>
            `;
        }
    }
}

window.onload = abrirArquivo;
