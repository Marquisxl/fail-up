document.addEventListener('DOMContentLoaded', () => {
    loadFailures();
    setupFailureForm();
    setupAnimations();
    setupInteractions();
    setupParticles();
    setupConfetti();
    setupModal();
    setupAnalysisSection();
});

function setupParticles() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1';
    canvas.style.opacity = '0.6';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationFrameId;
    let lastTime = 0;
    const particleInterval = 100; // パーティクル生成の間隔（ミリ秒）

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 3 + 1;
            this.speedX = Math.random() * 1 - 0.5;
            this.speedY = Math.random() * 1 - 0.5;
            this.color = `hsla(${Math.random() * 60 + 330}, 80%, 70%, 0.2)`;
            this.life = 1;
            this.decay = 0.02;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.life -= this.decay;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color.replace(')', `, ${this.life})`);
            ctx.fill();
        }
    }

    function createParticles(e) {
        const currentTime = Date.now();
        if (currentTime - lastTime < particleInterval) return;
        lastTime = currentTime;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        for (let i = 0; i < 2; i++) {
            particles.push(new Particle(x, y));
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();

            if (particles[i].life <= 0) {
                particles.splice(i, 1);
                i--;
            }
        }

        animationFrameId = requestAnimationFrame(animate);
    }

    window.addEventListener('mousemove', createParticles);
    animate();

    return () => {
        window.removeEventListener('mousemove', createParticles);
        cancelAnimationFrame(animationFrameId);
    };
}

function setupConfetti() {
    const colors = ['#FF3366', '#FF9933', '#00CC99', '#6633FF', '#FFCC00'];
    
    function createConfetti(x, y) {
        for (let i = 0; i < 30; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = x + 'px';
            confetti.style.top = y + 'px';
            confetti.style.setProperty('--angle', Math.random() * 360 + 'deg');
            confetti.style.setProperty('--speed', (Math.random() * 1 + 0.5) + 's');
            confetti.style.setProperty('--distance', (Math.random() * 100 + 50) + 'px');
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 2000);
        }
    }

    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', (e) => {
            const rect = button.getBoundingClientRect();
            createConfetti(rect.left + rect.width / 2, rect.top);
        });
    });
}

function setupInteractions() {
    // スムーズスクロール
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // ホバーエフェクト
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', (e) => {
            createRipple(e, button);
            button.style.transform = 'translateY(-4px) scale(1.05)';
        });
        
        button.addEventListener('mouseleave', (e) => {
            button.style.transform = 'translateY(0) scale(1)';
        });
    });

    // カードのホバーエフェクト
    document.querySelectorAll('.failure-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px) rotate(1deg)';
            card.style.boxShadow = '0 20px 30px rgba(0, 0, 0, 0.15)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) rotate(0deg)';
            card.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
        });
    });

    // 統計アイテムのホバーエフェクト
    document.querySelectorAll('.stat-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateY(-8px) rotate(-2deg)';
            const span = item.querySelector('span');
            span.style.animation = 'bounce 0.5s ease infinite';
        });

        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateY(0) rotate(0deg)';
            const span = item.querySelector('span');
            span.style.animation = 'none';
        });
    });
}

function createRipple(e, element) {
    const ripple = document.createElement('div');
    ripple.classList.add('ripple');
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    element.appendChild(ripple);
    
    ripple.addEventListener('animationend', () => {
        ripple.remove();
    });
}

function setupAnimations() {
    const form = document.querySelector('.failure-form');
    form.style.opacity = '0';
    form.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        form.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        form.style.opacity = '1';
        form.style.transform = 'translateY(0)';
    }, 100);

    // Intersection Observerの設定
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0) scale(1)';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // 監視対象の要素を登録
    document.querySelectorAll('.failure-card').forEach(card => {
        observer.observe(card);
    });
}

async function loadFailures() {
    try {
        const response = await fetch('/api/failures');
        const failures = await response.json();
        displayFailures(failures);
        updateStats(failures);
    } catch (error) {
        console.error('Error loading failures:', error);
        showNotification('データの読み込みに失敗しました', 'error');
    }
}

function updateStats(failures) {
    const totalPoints = failures.reduce((sum, failure) => sum + failure.points, 0);
    const totalFailures = failures.length;
    
    animateNumber('totalPoints', totalPoints);
    animateNumber('totalFailures', totalFailures);
}

function animateNumber(elementId, finalNumber) {
    const element = document.getElementById(elementId);
    const duration = 1500;
    const frameDuration = 1000 / 60;
    const frames = duration / frameDuration;
    const increment = finalNumber / frames;
    
    let currentNumber = 0;
    let frame = 0;

    const animate = () => {
        frame++;
        currentNumber = Math.min(currentNumber + increment, finalNumber);
        
        if (frame >= frames) {
            element.textContent = Math.round(finalNumber);
            return;
        }
        
        element.textContent = Math.round(currentNumber);
        requestAnimationFrame(animate);
    };

    animate();
}

function getCategoryIcon(category) {
    const icons = {
        '能力不足': '<i class="fas fa-graduation-cap"></i>',
        '努力不足': '<i class="fas fa-fire"></i>',
        '環境': '<i class="fas fa-compass"></i>',
        '運': '<i class="fas fa-dice"></i>'
    };
    return icons[category] || '<i class="fas fa-question"></i>';
}

function displayFailures(failures) {
    const container = document.getElementById('failuresList');
    container.innerHTML = '';

    failures.forEach(failure => {
        const card = document.createElement('div');
        card.className = 'failure-card';
        card.dataset.id = failure.id;
        
        if (failure.related_to || failure.relation_type) {
            card.classList.add('related-failure');
        }

        const content = document.createElement('div');
        content.className = 'failure-content';
        content.innerHTML = `
            <div class="failure-meta">
                <span class="category-tag">${getCategoryIcon(failure.category)}</span>
                <span class="exp-points">${failure.points}EXP</span>
            </div>
            <p class="failure-text">${failure.content}</p>
            ${failure.related_content ? `
                <div class="link-info">
                    <i class="fas fa-link"></i>
                </div>
            ` : ''}
        `;
        
        const actions = document.createElement('div');
        actions.className = 'failure-actions';
        
        const nextChallengeBtn = document.createElement('button');
        nextChallengeBtn.className = 'next-challenge-btn';
        nextChallengeBtn.innerHTML = '<i class="fas fa-forward"></i>';
        nextChallengeBtn.onclick = (e) => {
            e.stopPropagation();  // カードのクリックイベントを停止
            createNextChallenge(failure.id);
        };
        
        actions.appendChild(nextChallengeBtn);
        
        card.appendChild(content);
        card.appendChild(actions);
        
        // カード全体のクリックイベントを追加
        card.addEventListener('click', () => showDetailsPopup(failure));
        
        container.appendChild(card);
    });
}

function showDetailsPopup(failure) {
    const popup = document.createElement('div');
    popup.className = 'details-popup';
    
    const content = document.createElement('div');
    content.className = 'popup-content';
    
    content.innerHTML = `
        <div class="popup-header">
            <div class="header-content">
                <div class="header-main">
                    <div class="header-left">
                        <div class="category">
                            <span class="category-tag">${getCategoryIcon(failure.category)} ${failure.category}</span>
                        </div>
                        <div class="exp">
                            <span class="exp-points"><i class="fas fa-star"></i> ${failure.points}EXP</span>
                        </div>
                    </div>
                    <div class="header-actions">
                        <button class="delete-record" title="記録を削除">
                            <i class="fas fa-trash-alt"></i>
                            <span>削除</span>
                        </button>
                        <button class="close-popup">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="header-sub">
                    <div class="timestamp">
                        <i class="fas fa-clock"></i>
                        ${formatDate(failure.created_at)}
                    </div>
                </div>
            </div>
        </div>
        <div class="popup-body">
            <div class="detail-section">
                <h4>失敗内容</h4>
                <p class="detail-content">${failure.content}</p>
            </div>
            
            <div class="detail-section">
                <h4>分析</h4>
                <div class="analysis-grid">
                    <div class="analysis-item">
                        <span class="analysis-label"><i class="fas fa-brain"></i> 内的要因</span>
                        <div class="analysis-content">
                            ${failure.internal_factors ? 
                                `<div class="factor-tags">
                                    ${failure.internal_factors.split(',').map(factor => 
                                        `<span class="factor-tag">${factor.trim()}</span>`
                                    ).join('')}
                                </div>
                                <p>${failure.internal_factors_detail || ''}</p>` : 
                                '<p class="no-data">データなし</p>'
                            }
                        </div>
                    </div>
                    <div class="analysis-item">
                        <span class="analysis-label"><i class="fas fa-globe"></i> 外的要因</span>
                        <div class="analysis-content">
                            ${failure.external_factors ? 
                                `<div class="factor-tags">
                                    ${failure.external_factors.split(',').map(factor => 
                                        `<span class="factor-tag">${factor.trim()}</span>`
                                    ).join('')}
                                </div>
                                <p>${failure.external_factors_detail || ''}</p>` : 
                                '<p class="no-data">データなし</p>'
                            }
                        </div>
                    </div>
                </div>
            </div>
            
            ${failure.similar_cases ? `
                <div class="detail-section">
                    <h4><i class="fas fa-link"></i> 類似事例</h4>
                    <p class="detail-content">${failure.similar_cases}</p>
                </div>
            ` : ''}
            
            ${failure.reflection ? `
                <div class="detail-section">
                    <h4><i class="fas fa-lightbulb"></i> 振り返り</h4>
                    <p class="detail-content">${failure.reflection}</p>
                </div>
            ` : ''}
            
            ${failure.related_content ? `
                <div class="detail-section">
                    <h4><i class="fas fa-project-diagram"></i> 関連チャレンジ</h4>
                    <div class="related-content" data-failure-id="${failure.related_to}" style="cursor: pointer;">
                        <div class="relation-type">
                            <i class="fas fa-arrow-right"></i> ${failure.relation_type}
                        </div>
                        <p class="detail-content">${failure.related_content}</p>
                    </div>
                </div>
            ` : ''}
            
            ${failure.next_challenge ? `
                <div class="detail-section">
                    <h4><i class="fas fa-flag"></i> 次のチャレンジ</h4>
                    <div class="challenge-content">
                        <div class="challenge-tags">
                            ${failure.challenge_type ? failure.challenge_type.split(',').map(type => 
                                `<span class="challenge-tag">${type.trim()}</span>`
                            ).join('') : ''}
                        </div>
                        <p class="detail-content">${failure.next_challenge}</p>
                        ${failure.challenge_deadline ? `
                            <div class="deadline">
                                <i class="fas fa-calendar"></i> ${formatDate(failure.challenge_deadline)}
                            </div>
                        ` : ''}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    popup.appendChild(content);
    document.body.appendChild(popup);
    
    requestAnimationFrame(() => {
        popup.classList.add('active');
    });
    
    const closeBtn = popup.querySelector('.close-popup');
    closeBtn.onclick = () => {
        popup.classList.remove('active');
        setTimeout(() => popup.remove(), 300);
    };
    
    popup.onclick = (e) => {
        if (e.target === popup) {
            popup.classList.remove('active');
            setTimeout(() => popup.remove(), 300);
        }
    };

    // 関連チャレンジのクリックイベントを設定
    const relatedContent = popup.querySelector('.related-content');
    if (relatedContent) {
        relatedContent.addEventListener('click', async (e) => {
            e.stopPropagation();
            const failureId = relatedContent.dataset.failureId;
            
            try {
                const response = await fetch('/api/failures');
                const failures = await response.json();
                const relatedFailure = failures.find(f => f.id === parseInt(failureId));
                
                if (relatedFailure) {
                    // 現在のポップアップを閉じる
                    popup.classList.remove('active');
                    setTimeout(() => {
                        popup.remove();
                        // 関連する失敗の詳細を表示
                        showDetailsPopup(relatedFailure);
                    }, 300);
                }
            } catch (error) {
                console.error('Error loading related failure:', error);
                showNotification('関連する失敗の読み込みに失敗しました', 'error');
            }
        });
    }

    // 削除ボタンのイベントリスナーを設定
    const deleteBtn = popup.querySelector('.delete-record');
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        showDeleteConfirmation(failure, popup);
    };
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('ja-JP', options);
}

function setupModal() {
    const modal = document.getElementById('formModal');
    const openButton = document.getElementById('openFormButton');
    const closeButton = modal.querySelector('.close-button');

    function resetForm() {
        const form = document.getElementById('failureForm');
        const modalTitle = modal.querySelector('h2');
        const submitButton = form.querySelector('button[type="submit"]');
        const contentTextarea = document.getElementById('content');
        const internalFactorsDetail = document.getElementById('internal-factors-detail');
        const externalFactorsDetail = document.getElementById('external-factors-detail');
        const similarCases = document.getElementById('similar-cases');
        const nextChallenge = document.getElementById('next-challenge');
        const challengeDeadline = document.getElementById('challenge-deadline');
        
        // フォームのリセット
        form.reset();
        
        // テキストエリアの内容をクリア
        contentTextarea.value = '';
        internalFactorsDetail.value = '';
        externalFactorsDetail.value = '';
        similarCases.value = '';
        nextChallenge.value = '';
        
        // 日付入力をクリア
        challengeDeadline.value = '';
        
        // チェックボックスをすべて解除
        form.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // ラジオボタンをすべて解除
        form.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.checked = false;
        });
        
        // フォームの状態をリセット
        form.classList.remove('next-challenge-form');
        modalTitle.innerHTML = '<i class="fas fa-quill"></i> New Record';
        submitButton.innerHTML = '<i class="fas fa-scroll"></i> Record';
        contentTextarea.placeholder = 'Tell me about your failure...';
        
        // 関連付け情報をクリア
        delete form.dataset.relatedTo;
        delete form.dataset.relationType;
        
        // 前回の失敗セクションを削除
        const previousFailureSection = form.querySelector('.previous-failure-section');
        if (previousFailureSection) {
            previousFailureSection.remove();
        }
    }

    function openModal() {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // アニメーション効果
        createConfetti(
            openButton.getBoundingClientRect().left + openButton.offsetWidth / 2,
            openButton.getBoundingClientRect().top
        );
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        resetForm();
    }

    openButton.addEventListener('click', openModal);
    closeButton.addEventListener('click', closeModal);

    // モーダルの外側をクリックして閉じる
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // ESCキーでモーダルを閉じる
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

function setupFailureForm() {
    const form = document.getElementById('failureForm');
    const modal = document.getElementById('formModal');

    // カテゴリ選択時のエフェクト
    document.querySelectorAll('.category-option').forEach(option => {
        option.addEventListener('click', () => {
            createConfetti(
                option.getBoundingClientRect().left + option.offsetWidth / 2,
                option.getBoundingClientRect().top + option.offsetHeight / 2
            );
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const content = document.getElementById('content').value;
        const categoryInput = document.querySelector('input[name="category"]:checked');
        
        if (!categoryInput) {
            showNotification('カテゴリを選択してください', 'error');
            return;
        }
        
        const category = categoryInput.value;
        
        // 内的要因を取得
        const internalFactors = Array.from(document.querySelectorAll('input[name="internal-factors"]:checked'))
            .map(input => input.value)
            .join(',');
        const internalFactorsDetail = document.getElementById('internal-factors-detail').value;

        // 外的要因を取得
        const externalFactors = Array.from(document.querySelectorAll('input[name="external-factors"]:checked'))
            .map(input => input.value)
            .join(',');
        const externalFactorsDetail = document.getElementById('external-factors-detail').value;

        // 類似事例を取得
        const similarCases = document.getElementById('similar-cases').value;

        // 次のチャレンジを取得
        const nextChallenge = document.getElementById('next-challenge').value;
        const challengeType = Array.from(document.querySelectorAll('input[name="challenge-type"]:checked'))
            .map(input => input.value)
            .join(',');
        const challengeDeadline = document.getElementById('challenge-deadline').value;
        
        const data = {
            content,
            category,
            internal_factors: internalFactors,
            internal_factors_detail: internalFactorsDetail,
            external_factors: externalFactors,
            external_factors_detail: externalFactorsDetail,
            similar_cases: similarCases,
            next_challenge: nextChallenge,
            challenge_type: challengeType,
            challenge_deadline: challengeDeadline
        };
        
        // 関連付け情報がある場合は追加
        if (form.dataset.relatedTo) {
            data.related_to = parseInt(form.dataset.relatedTo);
            data.relation_type = form.dataset.relationType;
        }

        try {
            const response = await fetch('/api/failures', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                showNotification('記録を保存しました', 'success');
                modal.classList.remove('active');
                document.body.style.overflow = '';
                loadFailures();
            }
        } catch (error) {
            console.error('Error saving failure:', error);
            showNotification('保存に失敗しました', 'error');
        }
    });
}

async function addReflection(failureId) {
    const reflection = document.getElementById(`reflection-${failureId}`).value;
    
    if (!reflection.trim()) {
        showNotification('振り返りを入力してください', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/api/failures/${failureId}/reflection`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reflection }),
        });

        if (response.ok) {
            showNotification('振り返りを保存しました', 'success');
            loadFailures();
        }
    } catch (error) {
        console.error('Error saving reflection:', error);
        showNotification('振り返りの保存に失敗しました', 'error');
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
    `;
    
    document.body.appendChild(notification);
    
    requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    });
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(1rem)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// スタイルの追加
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 70%);
        pointer-events: none;
    }

    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }

    .confetti {
        position: fixed;
        width: 10px;
        height: 10px;
        pointer-events: none;
        opacity: 0;
        z-index: 999;
        animation: confetti-fall var(--speed) linear forwards;
        transform: rotate(var(--angle));
    }

    @keyframes confetti-fall {
        0% {
            opacity: 1;
            transform: translateY(0) rotate(var(--angle));
        }
        100% {
            opacity: 0;
            transform: translateY(var(--distance)) rotate(calc(var(--angle) + 360deg));
        }
    }

    .failure-card {
        opacity: 0;
        transform: translateY(20px) scale(0.95) rotate(-2deg);
        transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        will-change: transform, opacity, box-shadow;
    }

    .stat-item span {
        display: inline-block;
        will-change: transform;
    }

    @keyframes bounce {
        0%, 100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-10px);
        }
    }
`;
document.head.appendChild(style);

function setupAnalysisSection() {
    const form = document.querySelector('#failure-form');
    const tagOptions = document.querySelectorAll('.tag-option');
    
    tagOptions.forEach(option => {
        option.addEventListener('click', () => {
            const checkbox = option.querySelector('input[type="checkbox"]');
            checkbox.checked = !checkbox.checked;
            
            if (checkbox.checked) {
                playRetroSound('select');
                createButtonSparkle(option);
            }
        });
    });
    
    const textareas = form.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        textarea.addEventListener('input', () => {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        });
    });
}

function createNextChallenge(failureId) {
    const modal = document.getElementById('formModal');
    const form = document.getElementById('failureForm');
    
    // 関連付け情報を設定
    form.dataset.relatedTo = failureId;
    form.dataset.relationType = '次のチャレンジ';
    
    // 前回の失敗内容を取得
    const previousFailure = document.querySelector(`.failure-card[data-id="${failureId}"]`);
    const previousContent = previousFailure ? previousFailure.querySelector('h3').textContent : '';
    
    // モーダルを開く
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // フォームのタイトルとボタンテキストを更新
    const modalTitle = modal.querySelector('h2');
    modalTitle.innerHTML = '<i class="fas fa-forward"></i> 次のチャレンジを記録';
    
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.innerHTML = '<i class="fas fa-scroll"></i> チャレンジを記録';
    
    // 前回の失敗内容を表示するセクションを追加
    const previousFailureSection = document.createElement('div');
    previousFailureSection.className = 'previous-failure-section';
    previousFailureSection.innerHTML = `
        <div class="previous-failure-header">
            <i class="fas fa-history"></i> 前回の失敗
        </div>
        <div class="previous-failure-content">
            ${previousContent}
        </div>
    `;
    
    // 既存の前回の失敗セクションを削除
    const existingPreviousSection = form.querySelector('.previous-failure-section');
    if (existingPreviousSection) {
        existingPreviousSection.remove();
    }
    
    // フォームの最初の要素の前に挿入
    form.insertBefore(previousFailureSection, form.firstChild);
    
    // フォームの説明を追加
    const contentTextarea = document.getElementById('content');
    contentTextarea.placeholder = '前回の失敗を踏まえて、どのようなチャレンジをしますか？';
    
    // フォームにクラスを追加してスタイルを変更
    form.classList.add('next-challenge-form');
}

// スタイルを追加
const popupStyle = document.createElement('style');
popupStyle.textContent = `
    .details-popup {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(8px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        opacity: 0;
        transition: all 0.3s ease;
        padding: 1rem;
    }
    
    .details-popup.active {
        opacity: 1;
    }
    
    .popup-content {
        background: var(--surface-color);
        border-radius: 24px;
        width: 100%;
        max-width: 800px;
        max-height: 90vh;
        position: relative;
        transform: translateY(20px) scale(0.95);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        overflow: hidden;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    }
    
    .details-popup.active .popup-content {
        transform: translateY(0) scale(1);
    }
    
    .popup-header {
        padding: 1.5rem;
        background: var(--background-color);
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        position: relative;
    }
    
    .header-content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    
    .header-main {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .header-left {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    
    .header-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }
    
    .header-sub {
        display: flex;
        align-items: center;
        gap: 1rem;
        color: var(--text-secondary);
        font-size: 0.9rem;
    }
    
    .timestamp {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .delete-record {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1.25rem;
        min-width: 100px;
        border-radius: 12px;
        border: none;
        background: var(--surface-color);
        color: var(--text-secondary);
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        white-space: nowrap;
    }
    
    .delete-record i {
        font-size: 1rem;
    }
    
    .delete-record span {
        line-height: 1;
    }
    
    .delete-record:hover {
        background: var(--error-color);
        color: white;
        transform: translateY(-2px);
    }
    
    .delete-record:active {
        transform: translateY(0);
    }
    
    .close-popup {
        width: 36px;
        height: 36px;
        border-radius: 12px;
        border: none;
        background: var(--surface-color);
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .close-popup:hover {
        background: var(--text-secondary);
        color: white;
        transform: translateY(-2px);
    }
    
    .close-popup:active {
        transform: translateY(0);
    }
    
    .category-tag {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: var(--primary-color);
        color: white;
        border-radius: 12px;
        font-size: 0.9rem;
        font-weight: 600;
    }
    
    .exp-points {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: linear-gradient(135deg, #FFD700, #FFA500);
        color: white;
        border-radius: 12px;
        font-size: 0.9rem;
        font-weight: 600;
    }
    
    .popup-body {
        padding: 1.5rem 1.5rem 3rem 1.5rem;
        overflow-y: auto;
        max-height: calc(90vh - 80px);
    }
    
    .detail-section {
        margin-bottom: 2rem;
        padding-bottom: 2rem;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }
    
    .detail-section:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
    }
    
    .detail-section h4 {
        font-size: 1.1rem;
        color: var(--text-primary);
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .detail-section h4 i {
        color: var(--primary-color);
    }
    
    .detail-content {
        font-size: 1rem;
        line-height: 1.6;
        color: var(--text-primary);
        white-space: pre-wrap;
    }
    
    .analysis-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
    }
    
    .analysis-item {
        background: var(--background-color);
        border-radius: 16px;
        padding: 1.25rem;
    }
    
    .analysis-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: var(--primary-color);
    }
    
    .factor-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }
    
    .factor-tag {
        padding: 0.25rem 0.75rem;
        background: rgba(var(--primary-color-rgb), 0.1);
        color: var(--primary-color);
        border-radius: 8px;
        font-size: 0.85rem;
    }
    
    .challenge-tag {
        padding: 0.25rem 0.75rem;
        background: var(--primary-color);
        color: white;
        border-radius: 8px;
        font-size: 0.85rem;
    }
    
    .no-data {
        color: var(--text-secondary);
        font-style: italic;
    }
    
    .related-content, .challenge-content {
        background: var(--background-color);
        border-radius: 16px;
        padding: 1.25rem;
    }
    
    .relation-type {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 1rem;
        padding: 0.5rem 1rem;
        background: rgba(var(--primary-color-rgb), 0.1);
        color: var(--primary-color);
        border-radius: 8px;
        font-size: 0.9rem;
        font-weight: 600;
    }
    
    .deadline {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background: rgba(0, 0, 0, 0.05);
        color: var(--text-secondary);
        border-radius: 8px;
        font-size: 0.9rem;
    }
    
    @media (max-width: 768px) {
        .popup-content {
            max-width: 100%;
            margin: 0;
            border-radius: 0;
            height: 100%;
            max-height: 100%;
        }
        
        .popup-body {
            max-height: calc(100vh - 80px);
        }
        
        .analysis-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
        }
    }
`;

const cardStyle = document.createElement('style');
cardStyle.textContent = `
    #failuresList {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 1rem;
        padding: 1rem;
    }

    .failure-card {
        background: var(--surface-color);
        border-radius: 16px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        aspect-ratio: 1;
        cursor: pointer;  /* カーソルをポインターに変更 */
    }

    .failure-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }

    .failure-card:active {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .failure-content {
        flex-grow: 1;
        padding: 1rem;
        display: flex;
        flex-direction: column;
    }

    .failure-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
    }

    .failure-meta .category-tag {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(var(--primary-color-rgb), 0.1);
        color: var(--primary-color);
        border-radius: 6px;
        font-size: 0.8rem;
    }

    .failure-meta .exp-points {
        font-size: 0.75rem;
        color: var(--text-secondary);
        font-weight: 600;
    }

    .failure-text {
        font-size: 0.85rem;
        line-height: 1.4;
        color: var(--text-primary);
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        overflow: hidden;
        margin: 0;
    }

    .link-info {
        margin-top: auto;
        padding-top: 0.5rem;
        font-size: 0.75rem;
        color: var(--primary-color);
    }

    .failure-actions {
        display: flex;
        gap: 0.5rem;
        padding: 0.75rem;
        background: var(--background-color);
        justify-content: flex-end;
    }

    .details-btn, .next-challenge-btn {
        width: 28px;
        height: 28px;
        padding: 0;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--surface-color);
        color: var(--text-secondary);
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 0.8rem;
    }

    .details-btn:hover, .next-challenge-btn:hover {
        background: var(--primary-color);
        color: white;
        transform: translateY(-2px);
    }

    .related-failure::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 16px;
        height: 16px;
        background: var(--gradient-1);
        clip-path: polygon(100% 0, 0 0, 100% 100%);
    }

    @media (max-width: 768px) {
        #failuresList {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 0.75rem;
            padding: 0.75rem;
        }
        
        .failure-content {
            padding: 0.75rem;
        }
        
        .failure-actions {
            padding: 0.5rem;
        }
        
        .details-btn, .next-challenge-btn {
            width: 24px;
            height: 24px;
        }
    }
`;
document.head.appendChild(popupStyle);
document.head.appendChild(cardStyle);

function showDeleteConfirmation(failure, detailPopup) {
    const confirmPopup = document.createElement('div');
    confirmPopup.className = 'confirm-popup';
    
    confirmPopup.innerHTML = `
        <div class="confirm-content">
            <h3><i class="fas fa-exclamation-triangle"></i> 削除の確認</h3>
            <p>この記録を削除してもよろしいですか？</p>
            <p class="warning">この操作は取り消せません。</p>
            <div class="confirm-actions">
                <button class="cancel-btn">
                    <i class="fas fa-times"></i> キャンセル
                </button>
                <button class="delete-btn">
                    <i class="fas fa-trash-alt"></i> 削除する
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(confirmPopup);
    
    requestAnimationFrame(() => {
        confirmPopup.classList.add('active');
    });
    
    const cancelBtn = confirmPopup.querySelector('.cancel-btn');
    const deleteBtn = confirmPopup.querySelector('.delete-btn');
    
    cancelBtn.onclick = () => {
        confirmPopup.classList.remove('active');
        setTimeout(() => confirmPopup.remove(), 300);
    };
    
    deleteBtn.onclick = async () => {
        try {
            const response = await fetch(`/api/failures/${failure.id}`, {
                method: 'DELETE',
            });
            
            if (response.ok) {
                showNotification('記録を削除しました', 'success');
                confirmPopup.classList.remove('active');
                detailPopup.classList.remove('active');
                setTimeout(() => {
                    confirmPopup.remove();
                    detailPopup.remove();
                    loadFailures();
                }, 300);
            } else {
                throw new Error('削除に失敗しました');
            }
        } catch (error) {
            console.error('Error deleting failure:', error);
            showNotification('削除に失敗しました', 'error');
        }
    };
    
    confirmPopup.onclick = (e) => {
        if (e.target === confirmPopup) {
            confirmPopup.classList.remove('active');
            setTimeout(() => confirmPopup.remove(), 300);
        }
    };
}

// スタイルを追加
const confirmStyle = document.createElement('style');
confirmStyle.textContent = `
    .delete-record {
        margin-left: auto;
        width: 36px;
        height: 36px;
        border-radius: 12px;
        border: none;
        background: var(--surface-color);
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        margin-right: 0.5rem;
    }
    
    .delete-record:hover {
        background: var(--error-color);
        color: white;
        transform: scale(1.1);
    }
    
    .delete-record:active {
        transform: scale(0.95);
    }
    
    .confirm-popup {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(8px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1100;
        opacity: 0;
        transition: all 0.3s ease;
    }
    
    .confirm-popup.active {
        opacity: 1;
    }
    
    .confirm-content {
        background: var(--surface-color);
        border-radius: 24px;
        padding: 2rem;
        width: 90%;
        max-width: 400px;
        text-align: center;
        transform: translateY(20px) scale(0.95);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .confirm-popup.active .confirm-content {
        transform: translateY(0) scale(1);
    }
    
    .confirm-content h3 {
        color: var(--error-color);
        font-size: 1.5rem;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }
    
    .confirm-content p {
        margin-bottom: 1rem;
        color: var(--text-primary);
    }
    
    .confirm-content .warning {
        color: var(--error-color);
        font-size: 0.9rem;
        font-weight: 600;
    }
    
    .confirm-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 2rem;
    }
    
    .confirm-actions button {
        padding: 0.75rem 1.5rem;
        border-radius: 12px;
        border: none;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .cancel-btn {
        background: var(--background-color);
        color: var(--text-secondary);
    }
    
    .cancel-btn:hover {
        background: var(--text-secondary);
        color: white;
    }
    
    .delete-btn {
        background: var(--error-color);
        color: white;
    }
    
    .delete-btn:hover {
        background: #ff3333;
        transform: translateY(-2px);
    }
    
    .delete-btn:active {
        transform: translateY(0);
    }
`;
document.head.appendChild(confirmStyle); 