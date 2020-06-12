import Vue from 'vue'
import App from './App.vue'
import antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css';
Vue.config.productionTip = false;

Vue.use(antd)

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')