<template>
  <div id="app">
    <div class="filter">
      <span>请选择月份：</span>
      <a-select
        default-value
        v-model="month"
        class="select"
        @change="() => {filterData(); sortData()}"
      >
        <a-select-option key="ALL" value="ALL">未选择月份</a-select-option>
        <a-select-option v-for="month of months" :key="month" :value="month">{{ month }}</a-select-option>
      </a-select>
      <a-checkbox v-if="month!=='ALL'" v-model="show_sort_data">按照分类显示当前月份支出</a-checkbox>
      <template v-if="!show_sort_data || month==='ALL'">
        <span>请选择分类：</span>
        <a-select default-value v-model="category" class="select" @change="filterData">
          <a-select-option key="ALL" value="ALL">全部</a-select-option>
          <a-select-option
            v-for="category of categories"
            :key="category[0]"
            :value="category[0]"
          >{{ category[1] }}</a-select-option>
        </a-select>
        <span>总收入：￥{{ parseInt(income).toFixed(2) }}</span>
        <span class="block"></span>
        <span>总支出：￥{{ parseInt(cost).toFixed(2) }}</span>
      </template>
      <template v-else>
        <span>总支出：￥{{ parseInt(sort_cost).toFixed(2) }}</span>
      </template>
    </div>
    <div class="add-bill">
      <a-date-picker show-time v-model="form.time" class="timepicker" />
      <span class="block"></span>
      <span>账单分类：</span>
      <a-select default-value v-model="form.category" class="selector" @change="filterData">
        <a-select-option
          v-for="category of categories"
          :key="category[0]"
          :value="category[0]"
        >{{ category[1] }}</a-select-option>
      </a-select>
      <span class="block"></span>
      <span>账单类型：</span>
      <a-select default-value v-model="form.type" class="timepicker" @change="filterData">
        <a-select-option key="1" value="1">收入</a-select-option>
        <a-select-option key="0" value="0">支出</a-select-option>
      </a-select>
      <span class="block"></span>
      <span>账单金额：</span>
      <a-input v-model="form.amount" type="number" class="input"></a-input>
      <span class="block"></span>
      <a-button @click="add_bill">添加账单</a-button>
    </div>
    <a-table
      v-if="!show_sort_data || month==='ALL'"
      :data-source="display_data"
      :rowKey="record => record.index"
    >
      <a-table-column key="index" title="时间" data-index="time">
        <template v-slot="text">{{ text.toLocaleString() }}</template>
      </a-table-column>
      <a-table-column key="type" title="类型" data-index="type">
        <template v-slot="text">{{ text === "1" ? "收入" : "" }}{{ text === "0" ? "支出" : ""}}</template>
      </a-table-column>
      <a-table-column key="category" title="分类" data-index="categoryName"></a-table-column>
      <a-table-column key="amount" title="金额" data-index="amount">
        <template v-slot="text">￥{{ parseInt(text).toFixed(2) }}</template>
      </a-table-column>
    </a-table>
    <a-table v-else :data-source="sort_data" :rowKey="record => record.index">
      <a-table-column key="category" title="分类" data-index="categoryName"></a-table-column>
      <a-table-column key="amount" title="金额" data-index="amount">
        <template v-slot="text">￥{{ parseInt(text).toFixed(2) }}</template>
      </a-table-column>
    </a-table>
  </div>
</template>

<script>
// 引入数据
import import_bill from "./bill";
import import_category from "./category";
import csv_loader from "./csv_loader";
// 序列化数据
const origin_bill = csv_loader(import_bill);
const origin_category = csv_loader(import_category);
export default {
  name: "App",
  data() {
    return {
      month: "ALL",
      months: [],
      category: "ALL",
      // categories 为一个二维数组，第二维的第一位是分类id，第二位是分类名
      categories: [],
      origin_data: [],
      display_data: [],
      sort_data: [],
      sort_cost: 0,
      cost: 0,
      income: 0,
      show_sort_data: false,
      form: {
        time: null,
        category: "",
        type: "1",
        amount: null
      }
    };
  },
  methods: {
    transfer_data(bill) {
      let data = Object.assign({}, bill);
      data.time = new Date(bill.time);
      let category = origin_category.find(
        category => category.id === bill.category
      );
      data.categoryName = category ? category.name : "";
      data.categoryName = data.category ? data.categoryName : "未知";
      let year = data.time.getFullYear();
      let month = (data.time.getMonth() + 1).toString().padStart(2, "0");
      data.month = `${year}-${month}`;
      return data;
    },
    initData() {
      // 扁平化数据，同时将时间戳转化为时间类型
      let origin_data = [];
      origin_bill.forEach(bill => {
        bill.time = parseInt(bill.time);
        let data = this.transfer_data(bill);
        origin_data.push(data);
      });

      let categories = [];
      categories.push(["", "未知"]);
      origin_category.forEach(category => {
        categories.push([category.id, category.name]);
      });
      this.categories = categories;
      this.origin_data = origin_data;
      // 初始化数据完毕自动更新过滤器
      this.updateFilter();
    },
    parseInt(...args) {
      return parseInt(...args);
    },
    updateFilter() {
      // 更新过滤器信息，提取出账单中存在的所有月份和分类，并更新筛选框
      // 此处根据需求，显示所有 “分类”，也可以只展示账单中存在的分类。
      // 该处实现为展示所有账单分类

      // 直接定义为 Set 分类，因此无需判断是否存在
      let months = new Set();
      this.origin_data.forEach(data => {
        months.add(data.month);
      });
      months = Array.from(months);
      this.months = months;

      // 重置表格内容
      this.filterData();
    },
    filterData() {
      // 过滤账单
      let display_data = this.origin_data.map((data, index) =>
        Object.assign({}, data, { index })
      );
      if (this.month !== "ALL") {
        display_data = display_data.filter(data => data.month === this.month);
        console.log(display_data);
      }
      if (this.category !== "ALL") {
        display_data = display_data.filter(
          data => data.category === this.category
        );
      }
      this.display_data = display_data;

      // 自动计算支出和收入，按照分类排序
      this.caculateAmount();
      this.sortData();
    },
    caculateAmount() {
      let cost = 0;
      let income = 0;
      this.display_data.forEach(data => {
        if (data.type === "1") income += parseInt(data.amount);
        if (data.type === "0") cost += parseInt(data.amount);
      });
      this.cost = cost;
      this.income = income;
    },
    sortData() {
      // 过滤账单
      let current_month_data = this.origin_data;
      current_month_data = current_month_data.filter(
        data => data.month === this.month && data.type === "0"
      );
      let sort_data = [];
      let sort_cost = 0;
      let index = 0;
      current_month_data.forEach(monthly_data => {
        let current_type = sort_data.find(
          data => data.category === monthly_data.category
        );
        if (current_type === void 0) {
          current_type = {
            index: index++,
            category: monthly_data.category,
            categoryName: monthly_data.categoryName,
            amount: 0
          };
          sort_data.push(current_type);
        }
        current_type.amount += parseInt(monthly_data.amount);
        sort_cost += parseInt(monthly_data.amount);
      });
      sort_data.sort((data1, data2) => data2.amount - data1.amount);
      this.sort_data = sort_data;
      this.sort_cost = sort_cost;
    },
    add_bill() {
      if (
        this.form.time === null ||
        this.form.amount === null ||
        this.form.amount === ""
      ) {
        this.$message.error("请输入时间和金额");
        return;
      } else {
        let data = this.transfer_data(this.form);
        this.form.time = null;
        this.form.type = 1;
        this.form.category = "";
        this.form.amount = null;
        this.origin_data.push(data);
        this.filterData();
        this.$message.success("添加成功");
      }
    }
  },
  created() {
    // 自动初始化
    this.initData();
  }
};
</script>
<style lang="css">
body {
  padding: 10px 20px;
}
.filter {
  margin: 0 0 20px;
}
.filter .select {
  width: 200px;
  margin: 0 20px;
}

.filter .block,
.add-bill .block {
  margin: 0 10px;
}

.add-bill {
  margin: 0 0 20px;
}

.add-bill > * {
  display: inline-block;
}

.add-bill .timepicker {
  width: 200px;
}

.add-bill .selector {
  width: 150px;
}

.add-bill .input {
  width: 200px;
}
</style>