# 使用说明 #
1. 环境：任意操作系统，lts 版本或更高版本的 nodejs, 查看代码时需保证换行符为 \n
2. 安装依赖 # npm i
3. 运行demo # npm run serve
4. 使用浏览器，访问 localhost:8080 (请尽量选用支持 ES6 语法的浏览器预览)

# 思考过程 #
1. 总览一遍所有需求
2. 考虑没有明确提到但实际需要用的的需求（如页面翻页，数据缓存，性能，样式等问题）
3. 需求中未提到，但实际开发中需要的数据
4. 考虑需求中自相矛盾或可能自相矛盾的问题
5. 查看提供的数据 demo，并比照提供的格式
6. 考虑 i18n 或之后是否有可能需要修改显示内容（目前不考虑，全部 hard code）
7. 考虑具体开发使用的工具，如脚手架，UI库等（由于没有提供设计，因此采用自己熟悉的脚手架及UI库）
8. 考虑是否需要规范的代码注释及自动化流程（当前不采用）

# 问题 #
1. 需求中的字段信息中，“Date” 是 ISO 8601 标准，但是提供的 demo 数据中，该字段为时间戳，与需求不符
2. 两个字段中的 “分类类型” 实际是同一组数据，但是接受两个输入，假如这两个类型互相冲突如何解决
3. 数据的提供方式没有提供（即没有给出具体接口）
4. demo 过程中数据转换问题
5. 筛选 type 时，是否应当考虑账单数据中含有类型数据中不存在的类型
6. 样式未进行要求
7. 账单类型中，支出和收入都有正有负
8. 时间格式化中，时区的问题。
9. 添加账单的问题
10. 对输入数据的校验


# 解决方法 #
(实际情况中可以与需求提出者沟通，此处无法沟通，因此选择其他方法)
1. 由于 JS 的 Date 构造方法可以自动处理这两者，因此可以将其直接传入，并且转化为 Date 类数据以备使用。
2. 无法解决，暂定取账单类型的值，因为该值必定存在。
3. 暂时使用 mock 数据。
4. 在实际应用中可以考虑引入第三方库负责解析 csv 格式的文件。当前demo中由于数据源可控，因此使用 js 文件 export demo 数据并且自行编写简单的数据处理方法
5. 默认数据来源可靠，数据表格中包含所有可能的类型数据，但由于账单列表中类型一栏为非必要，因此将无类型添加为“未知”
6. = =让页面不难看即可
7. 不作为错误处理
8. 考虑到尽量少引入第三方组件，因此仅调用系统Date函数处理时间，并默认使用者为东八区。如需处理不同时区的情况，可调用第三方组件进行规范格式化。
9. 未将新添加的账单持久化，因此页面刷新后会恢复。
10. 简单校验