new Vue({
    el: '#app',
    // 封装数据
    data() {
        return {
            activeTab: 'login', // 初始的页面
            loginForm: {
                username: '',
                password: '',
            },
            registerForm: { // 注册表单数据
                username: '',
                password: '',
                confirmPassword: ''
            },
            phoneForm: {
                phone: '',
                phoneCode: '',
            },
            errorMessage: '', // 错误信息
            countdown: 0 // 获取验证码倒计时
        };
    },
    // 按钮内容
    computed: {
        buttonText() {
            if (this.activeTab === 'login' || this.activeTab === 'phone') {
                return '登录';
            } else {
                return '注册';
            }
        }
    },
    methods: {
        // 切换页面底部文字
        toggleTab() {
            this.activeTab = this.activeTab === 'login' ? 'register' : 'login';
        },
        // 验证注册表单
        validateRegisterForm() {
            let username = this.registerForm.username.trim();
            let password = this.registerForm.password.trim();
            let confirmPassword = this.registerForm.confirmPassword.trim();
            // 最大和最小密码位数
            const MIN_PASSWORD_LENGTH = 6;
            const MAX_PASSWORD_LENGTH = 12;

            if (username === '') {
                this.showErrorNotification('用户名不能为空！');
                return false;
            }

            if (password === '') {
                this.showErrorNotification('密码不能为空！');
                return false;
            } else if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
                this.showErrorNotification(`密码长度需在${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH}位之间！`);
                return false;
            }

            if (confirmPassword !== password) {
                this.showErrorNotification('两次输入的密码不一致！');
                return false;
            }
            // 验证无误，返回
            return true;
        },
        // 提交表单
        submitForm() {
            // 注册逻辑
            if (this.activeTab === 'register') {
                if (this.validateRegisterForm()) {
                    axios.post('/api/user/register', this.registerForm)
                        .then(response => {
                            const success = response.data.success;
                            if (success) {
                                this.showSuccessNotification("注册成功！")
                                if (this.registerForm.username === 'admin') {
                                    location.href = "/index.html"
                                } else {
                                    location.href = "/other.html"
                                }
                            }else {
                                this.showErrorNotification("注册失败！")
                            }

                        })
                        .catch(error => {
                            console.error(error)
                        });
                }
            } else if (this.activeTab === 'login') {
                // 登录逻辑
                if (this.validateForm()) {
                    axios.post('/api/user/login', this.loginForm)
                        .then(response => {
                            const success = response.data.success;
                            if (success) {
                                this.showSuccessNotification("登录成功！")
                                if (this.loginForm.username === 'admin') {
                                    location.href = "/index.html"
                                } else {
                                    location.href = "/other.html"
                                }
                            }else {
                                this.showErrorNotification("登录失败！")
                            }
                        })
                        .catch(error => {
                            console.error(error)
                        });
                }
            }else {
                axios.post('/api/user/phone/login', this.phoneForm)
                    .then(response => {
                        const success = response.data.success;
                        if (success) {
                            this.showSuccessNotification("登录成功！");
                            location.href = "/index.html"
                        }else {
                            this.showErrorNotification("登录失败！");
                        }
                    })
                    .catch(error => {
                        console.error(error)
                    });
            }
        },
        // 发送验证码
        getCode() {
            if (this.countdown > 0) return;
            if (this.phoneForm.phone === '') {
                this.showErrorNotification('手机号不能为空！');
                return;
            }
            if (!/^1[3-9]\d{9}$/.test(this.phoneForm.phone)) {
                this.showErrorNotification('请输入正确的手机号！')
                return;
            }
            // 发送验证码
            axios.post('/api/user/send/phone',this.phoneForm);
            // 发送验证码时间 单位：s
            this.countdown = 60;
            let countdownTimer = setInterval(() => {
                this.countdown--;
                if (this.countdown <= 0) {
                    clearInterval(countdownTimer);
                }
            }, 1000);
        },
        validateForm() {
            let username = this.loginForm.username.trim();
            let password = this.loginForm.password.trim();

            if (username === '') {
                this.showErrorNotification('用户名不能为空！');
                return false;
            }

            if (password === '') {
                this.showErrorNotification('密码不能为空！')
                return false;
            }

            return true;
        },
        showErrorNotification(message) {
            // 显示错误通知
            this.$notify.error({
                title: '错误',
                message: message
            });
        },
        showSuccessNotification(message) {
            this.$notify({
                title: '成功',
                message: message,
                type: 'success'
            })
        },
    }
});