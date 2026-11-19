// M PLUS Rounded 1c (SIL OFL 1.1, xem assets/fonts/MPLUSRounded1c-OFL.txt): font bo tròn
// gần với Baloo 2 trong bản thiết kế, nhưng có đủ tiếng Việt và ký hiệu IPA (ɪ ə θ ʃ ŋ ˈ…).
// File gốc kèm chữ Nhật nên ~3,5MB/độ đậm; bản trong repo đã được cắt bớt (fontTools subset)
// chỉ còn Latin, tiếng Việt, IPA, Hy Lạp và dấu câu, ~250KB/độ đậm.
// Android không tự chọn độ đậm cho font tùy biến, nên mỗi độ đậm là một family riêng
// và các style dùng `fontFamily` thay cho `fontWeight`.
export const homeFontFiles = {
  "MPlusRounded-Medium": require("../../../assets/fonts/MPLUSRounded1c_500Medium.ttf"),
  "MPlusRounded-Bold": require("../../../assets/fonts/MPLUSRounded1c_700Bold.ttf"),
  "MPlusRounded-ExtraBold": require("../../../assets/fonts/MPLUSRounded1c_800ExtraBold.ttf"),
};

export const homeFonts = {
  /** Bản thiết kế dùng 600; font này không có 600 nên dùng 500. */
  semibold: "MPlusRounded-Medium",
  bold: "MPlusRounded-Bold",
  extrabold: "MPlusRounded-ExtraBold",
} as const;
