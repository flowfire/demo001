export default function (csv) {
    let arr_result = []
    let arr_csv = csv.split("\n")
    let types = arr_csv.shift().split(",")
    arr_csv.forEach(single_data => {
        let result_single_data = {}
        let arr_single_data = single_data.split(",")
        types.forEach((type, index) => {
            result_single_data[type] = arr_single_data[index]
        })
        arr_result.push(result_single_data)
    })
    return arr_result
}