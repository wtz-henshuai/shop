<template>
  <div class="login_container">
    <div class="loginBox">
      <div class="login_avatar">
        <img src="../assets/logo.png" alt />
      </div>
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef">
        <div class="loginSection">
          <div class="loginAccount">
            <el-form-item prop="account">
              <el-input
                placeholder="请输入账户名"
                v-model="loginForm.account"
                clearable
                autocomplete="off"
                prefix-icon="iconfont icon-user"
              ></el-input>
            </el-form-item>
          </div>
          <div class="loginPassword">
            <el-form-item prop="password">
              <el-input
                placeholder="请输入密码"
                v-model="loginForm.password"
                show-password
                prefix-icon="iconfont icon-3702mima"
              ></el-input>
            </el-form-item>
          </div>
          <div class="loginBtns">
            <el-button type="primary" @click="login">登录</el-button>
            <el-button type="info" @click="resetLoginForm">重置</el-button>
          </div>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginForm: {
        account: 'admin',
        password: '123456'
      },
      rules: {
        account: [
          { required: true, message: '请输入账户名', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 8 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    };
  },
  methods: {
    login() {
      // 登录前验证: 获取表单对象 调用validate方法
      this.$refs.loginFormRef.validate(async (isTrue) => {
        if (!isTrue) return;
        let res = await this.$axios.post('https://www.liulongbin.top:8888/api/private/v1/login', {
          username: this.loginForm.account,
          password: this.loginForm.password
        });
        // 判断登录状态
        if (res.meta.status === 200) {
          // 设置相应消息提示 需要引入message组件
          this.$message({
            message: '恭喜登录成功!',
            type: 'success'
          });
          // 获取令牌token 保存至sessionStorge中 然后跳转主页
          sessionStorage.setItem('Token', res.data.token);
          setTimeout(() => {
            this.$router.push('/home')
          }, 1000);
        } else {
          this.$message.error('登录失败:' + res.meta.msg)
        }
      });
    },
    resetLoginForm() {
      // 重置表单
      this.$refs.loginFormRef.resetFields();
    }
  }
};
</script>

<style lang="less" >
.login_container {
  position: relative;
  height: 100%;
  background-color: #2b4b6b;
  .loginBox {
    position: absolute;
    width: 450px;
    height: 300px;
    border: 1px solid #ccc;
    background-color: #fff;
    border-radius: 6px;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    .login_avatar {
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100px;
      height: 100px;
      border-radius: 50%;
      border: 1px solid #eee;
      background-color: #fff;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
      padding: 10px;
      img {
        width: 100%;
        height: 100%;
        border: 1px solid #eee;
        border-radius: 50%;
      }
    }
    .loginSection {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 100%;
      padding: 0 30px;
      box-sizing: border-box;
      .loginAccount,
      .loginPassword {
        width: 100%;
        i.icon-user {
          position: absolute;
          z-index: 2;

          width: 20px;
          height: 20px;
        }
        input.el-input__inner {
          padding-left: 30px;
        }
      }
      .loginPassword {
        margin-top: 15px;
      }
      .loginBtns {
        margin-top: 15px;
        text-align: right;
      }
    }
  }
}
</style>
