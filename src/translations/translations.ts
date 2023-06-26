interface Translation {
    [key: string]: {
        [key: string]: string
    }
}

const translations: Translation = {
    "welcome message": {
        "en": "Welcome to the room!\nJoin our discord server on https://discord.gg/PSS5Pc7PYf\nType !help for a list of commands.",
        "pt": "Bem-vindo à sala!\nVê as tuas estatísticas no nosso discord https://discord.gg/PSS5Pc7PYf\nDigita !help para uma lista de comandos."
    },
    "unknown command": {
        "en": "Unknown command. Type !help for a list of commands.",
        "pt": "Comando desconhecido. Digita !help para uma lista de comandos."
    },
    "help message": {
        "en": "Available commands:\n" +
        "!me <game mode> - get your stats, leave game mode empty to list global stats\n" +
        "!mvp - get info about the points system\n" +
        "!v <choice>- vote for the current ballot\n" +
        "!afk - toggle afk mode\n" +
        "!afks - list all afk players\n" +
        "!about - get info about this server\n" +
        "!bb - quit the game\n" +
        "!help - get this message",
        "pt": "Comandos disponíveis:\n" +
        "!me <modo de jogo> - vê as tuas estatísticas, deixa o modo de jogo vazio para veres as estatísticas globais\n" +
        "!mvp - vê informação sobre o sistema de pontos\n" +
        "!v <escolha>- vota na votação atual\n" +
        "!afk - ativa/desativa o modo afk\n" +
        "!afks - lista todos os jogadores afk\n" +
        "!about - vê informação sobre este servidor\n" +
        "!bb - sai do jogo\n" +
        "!help - vê esta mensagem"
    },
    "specify only one game mode": {
        "en": "Please specify only one game mode!",
        "pt": "Por favor especifica apenas um modo de jogo!"
    },
    "no stats for player": {
        "en": "No stats for this player",
        "pt": "Sem estatísticas para este jogador."
    },
    "stats": {
        "en": "Goals: {goals}\n" +
                "Assists: {assists}\n" +
                "Own Goals: {ownGoals}\n" +
                "Shot p/ game: {shotsPerGame}\n" +
                "Saves p/ game: {savesPerGame}\n" +
                "Passes p/ game: {passesPerGame}\n" +
                "Wins: {wins}\n" +
                "Losses: {losses}",
        "pt": "Golos: {goals}\n" +
            "Assistências: {assists}\n" +
            "Auto-golos: {ownGoals}\n" +
            "Remates p/ jogo: {shotsPerGame}\n" +
            "Defesas p/ jogo: {savesPerGame}\n" +
            "Passes p/ jogo: {passesPerGame}\n" +
            "Vitórias: {wins}\n" +
            "Derrotas: {losses}"
    },
    "stats global": {
        "en": "Your global stats:\n",
        "pt": "As tuas estatísticas globais:\n"
    },
    "stats for game mode": {
        "en": "Your stats for {gameMode}:\n",
        "pt": "As tuas estatísticas para {gameMode}:\n"
    },
    "quit message": {
        "en": "Goodbye! Check out your stats on discord: https://discord.gg/PSS5Pc7PYf",
        "pt": "Até à próxima! Vê as tuas estatísticas no discord: https://discord.gg/PSS5Pc7PYf"
    },
    "about message": {
        "en": "This server is programmed by @🍍Stilton#4932\n" + 
            "It's main objective is to gather data and train a predictive xG model.\n" +
            "Feel free to contribute at https://github.com/JeronimoMendes/HaxBall-server\n" + 
            "Checkout detailed stats on discord: https://discord.gg/PSS5Pc7PYf",
        "pt": "Este servidor foi programado por @🍍Stilton#4932\n" +
            "O seu objetivo principal é recolher dados e treinar um modelo preditivo de xG.\n" +
            "Sente-te à vontade para contribuir em https://github.com/JeronimoMendes/HaxBall-server\n" +
            "Vê estatísticas detalhadas no discord: https://discord.gg/PSS5Pc7PYf"
    },
    "specify a vote": {
        "en": "Please specify a vote!",
        "pt": "Por favor especifica um voto!"
    },
    "specify only one vote": {
        "en": "Please specify only one vote!",
        "pt": "Por favor especifica apenas um voto!"
    },
    "afk on": {
        "en": "AFK mode on",
        "pt": "Modo AFK ativado"
    },
    "afk off": {
        "en": "AFK mode off",
        "pt": "Modo AFK desativado"
    },
    "afk list": {
        "en": "AFK players:\n",
        "pt": "Jogadores AFK:\n"
    },
    "afk list empty": {
        "en": "No AFK players",
        "pt": "Sem jogadores AFK"
    },
    "not admin": {
        "en": "You are not an admin!",
        "pt": "Não és um admin!"
    },
    "player not found": {
        "en": "Player not found!",
        "pt": "Jogador não encontrado!"
    },
    "player muted": {
        "en": "Player {player} is now muted!",
        "pt": "O jogador {player} está agora silenciado!"
    },
    "player unmuted": {
        "en": "Player  {player} is now unmuted!",
        "pt": "O jogador {player} já não está silenciado!"
    },
    "muted list": {
        "en": "Muted players:\n",
        "pt": "Jogadores silenciados:\n"
    },
    "muted list empty": {
        "en": "No muted players",
        "pt": "Sem jogadores silenciados"
    },
    "no voting": {
        "en": "There is no voting going on!",
        "pt": "Não há nenhuma votação a decorrer!"
    },
    "voting initial gamemode": {
        "en": "A voting will start to determine if we continue playing the current {gameMode1} game or if we start a new {gameMode2}",
        "pt": "Uma votação vai começar para determinar se continuamos a jogar o atual jogo de {gameMode1} ou se começamos um novo de {gameMode2}"
    },
    "voting gamemode options": {
        "en": "Use !v {gameMode1} or !v {gameMode2} to cast your vote",
        "pt": "Usa !v {gameMode1} ou !v {gameMode2} para votares"
    },
    "invalid vote": {
        "en": "Invalid vote: {vote}",
        "pt": "Voto inválido: {vote}"
    },
    "duplicate vote": {
        "en": "You already voted for {vote}",
        "pt": "Já votaste em {vote}"
    },
    "someone voted": {
        "en": "Someone voted.\nVotes for {gameMode1}: {votes1}\nVotes for {gameMode2}: {votes2}",
        "pt": "Alguém votou.\nVotos para {gameMode1}: {votes1}\nVotos para {gameMode2}: {votes2}"
    },
    "remember to cast vote": {
        "en": "Remember to cast your vote using !v {gameMode1} or !v {gameMode2}",
        "pt": "Lembra-te de votar usando !v {gameMode1} ou !v {gameMode2}"
    },
    "vote registered": {
        "en": "Your vote for {vote} was registered",
        "pt": "O teu voto para {vote} foi registado"
    },
    "voting tie gamemode": {
        "en": "The voting ended in a tie. We will continue playing the current {gameMode} game",
        "pt": "A votação terminou empatada. Vamos continuar a jogar o atual jogo de {gameMode}"
    },
    "voting won gamemode": {
        "en": "The voting ended. We will start a new {gameMode} game",
        "pt": "A votação terminou. Vamos começar um novo jogo de {gameMode}"
    },
    "substitution": {
        "en": "Substitution: {playerOut} out, {playerIn} in",
        "pt": "Substituição: {playerOut} sai, {playerIn} entra"
    },
    "mvp": {
        "en": "The MVP of the game was {player} with {points} points.\nUse !mvp to check pointing system",
        "pt": "O MVP do jogo foi {player} com {points} pontos.\nUsa !mvp para veres o sistema de pontuação"
    },
    "mvp command": {
        "en": "The MVP of the game is the player with the most points.\nPoints are awarded as follows:\n" +
            "Goal: 8 point\n" +
            "Assist: 4 point\n" +
            "Saves: 3 point\n" +
            "Passes: 2 point\n" +
            "Own goal: -5 point\n",
        "pt": "O MVP do jogo é o jogador com mais pontos.\nOs pontos são atribuídos da seguinte forma:\n" +
            "Golo: 8 pontos\n" +
            "Assistência: 4 pontos\n" +
            "Defesas: 3 pontos\n" +
            "Passes: 2 pontos\n" +
            "Auto-golo: -5 pontos\n"
    },
    "discord invite": {
        "en": "Check more game statistics on our discord: https://discord.gg/PSS5Pc7PYf",
        "pt": "Vê mais estatísticas no nosso discord: https://discord.gg/PSS5Pc7PYf"
    },
    "afk warning": {
        "en": "You seem AFK. Move to avoid being kicked!",
        "pt": "Pareces estar AFK. Mexe-te para evitar seres expulso!"
    },
    "afk enabled": {
        "en": "You are now AFK. Type !afk to disable it. You won't be drafted to any game while in AFK mode!",
        "pt": "Estás agora AFK. Escreve !afk para desativar. Não entrarás para nenhum jogo enquanto estiveres em modo AFK!"
    }
}

export default translations;