const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#333333',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: {
        preload: preload,
        create: create
    }
};

const game = new Phaser.Game(config);

let currentCards = [];
let deck = [];

// Player name handling
const setupPlayerNames = () => {
    ['p1', 'p2', 'p3', 'p4'].forEach(id => {
        const input = document.getElementById(`${id}-input`);
        const savedName = localStorage.getItem(`player-name-${id}`);
        
        if (savedName) {
            input.value = savedName;
        } else {
            input.value = id.toUpperCase().replace('P', 'Player ');
        }

        input.addEventListener('change', (e) => {
            localStorage.setItem(`player-name-${id}`, e.target.value);
        });
    });
};

function preload() {
    this.load.image('table', 'assets/table_top.png');
    this.load.image('cardBack', 'assets/card back black.png');

    const suits = ['clubs', 'diamonds', 'hearts', 'spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'ace', 'jack', 'queen', 'king'];

    values.forEach(value => {
        suits.forEach(suit => {
            let fileName = `${value}_of_${suit}`;
            if (['jack', 'queen', 'king'].includes(value)) {
                fileName += '2';
            }
            this.load.image(fileName, `assets/${fileName}.png`);
            deck.push(fileName);
        });
    });
}

function create() {
    // Add background table
    const table = this.add.image(400, 300, 'table');
    // Scale table to fit canvas
    table.setDisplaySize(800, 600);

    // Positions for 4 players (Bottom, Top, Left, Right)
    const positions = [
        { name: 'bottom', x: 400, y: 450, spacing: 50, rotation: 0 },
        { name: 'top', x: 400, y: 150, spacing: 50, rotation: 0 },
        { name: 'left', x: 150, y: 300, spacing: 50, rotation: 0 },
        { name: 'right', x: 650, y: 300, spacing: 50, rotation: 0 }
    ];

    const dealNewHand = () => {
        // Clear existing cards
        currentCards.forEach(card => card.destroy());
        currentCards = [];

        // Shuffle deck
        const shuffledDeck = Phaser.Utils.Array.Shuffle([...deck]);
        
        // Deal 3 cards to 4 positions
        let cardIndex = 0;
        positions.forEach(pos => {
            for (let i = 0; i < 3; i++) {
                const cardKey = shuffledDeck[cardIndex++];
                
                let x = pos.x;
                let y = pos.y;
                
                // Adjust x/y based on spacing
                if (pos.name === 'bottom' || pos.name === 'top') {
                    x += (i - 1) * pos.spacing;
                } else {
                    y += (i - 1) * pos.spacing;
                }

                const card = this.add.image(x, y, 'cardBack');
                card.faceKey = cardKey;
                card.setScale(0.11); // Nền đen nhỏ hơn để khớp với lá bài
                card.setRotation(pos.rotation);
                card.setInteractive({ useHandCursor: true });

                card.on('pointerdown', () => {
                    if (card.texture.key === 'cardBack') {
                        this.tweens.add({
                            targets: card,
                            scaleX: 0,
                            duration: 100,
                            onComplete: () => {
                                card.setTexture(card.faceKey);
                                card.setScale(0.15); // Mặt trước dùng tỷ lệ 0.15
                                card.scaleX = 0; // Reset scaleX để tween từ 0
                                this.tweens.add({
                                    targets: card,
                                    scaleX: 0.15,
                                    duration: 100
                                });
                            }
                        });
                    }
                });

                currentCards.push(card);
                
                // Add a small animation for dealing
                card.setAlpha(0);
                this.tweens.add({
                    targets: card,
                    alpha: 1,
                    duration: 200,
                    delay: cardIndex * 50
                });
            }
        });
    };

    // Initial deal
    dealNewHand();

    // Setup button
    const dealButton = document.getElementById('deal-button');
    dealButton.addEventListener('click', () => {
        dealNewHand();
    });

    // Setup player name inputs
    setupPlayerNames();
}
