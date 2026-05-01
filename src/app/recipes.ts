export type Tag = "時短" | "節約" | "がっつり" | "ヘルシー";
export type Difficulty = "初級" | "中級";

export type Recipe = {
  id: string;
  name: string;
  servings: number;
  ingredients: string[];
  steps: string[];
  cookingTime: number;
  difficulty: Difficulty;
  tags: Tag[];
  genre: string;
  category: string;
  tips: string;
};

type BaseRecipeTemplate = {
  title: string;
  main: string;
  sub: string;
  seasonings: string[];
  genre: string;
  category: string;
  tags: Tag[];
  tips: string;
};

const BASE_TEMPLATES: BaseRecipeTemplate[] = [
  { title: "炒め", main: "豚こま", sub: "玉ねぎ", seasonings: ["醤油", "みりん", "砂糖"], genre: "和食", category: "主菜", tags: ["時短", "節約", "がっつり"], tips: "強火で手早く炒めると香りよく仕上がります。" },
  { title: "卵とじ", main: "鶏むね肉", sub: "長ねぎ", seasonings: ["醤油", "酒", "みりん"], genre: "和食", category: "主菜", tags: ["節約", "ヘルシー"], tips: "卵は最後に回し入れて半熟で止めるとふんわりします。" },
  { title: "スープ", main: "キャベツ", sub: "卵", seasonings: ["塩", "こしょう", "鶏ガラスープの素"], genre: "中華", category: "汁物", tags: ["時短", "ヘルシー"], tips: "沸騰しすぎない火加減で卵を入れるときれいに広がります。" },
  { title: "マヨ和え", main: "ツナ", sub: "きゅうり", seasonings: ["マヨネーズ", "塩", "こしょう"], genre: "その他", category: "副菜", tags: ["時短", "節約"], tips: "水気をよく切ると味がぼやけません。" },
  { title: "炒飯", main: "ご飯", sub: "卵", seasonings: ["塩", "こしょう", "醤油", "ごま油"], genre: "中華", category: "主菜", tags: ["時短", "がっつり"], tips: "温かいご飯を使うとパラっと仕上がります。" },
  { title: "味噌炒め", main: "豚こま", sub: "キャベツ", seasonings: ["味噌", "みりん", "酒", "砂糖"], genre: "和食", category: "主菜", tags: ["節約", "がっつり"], tips: "味噌は焦げやすいので最後に加えて絡めます。" },
  { title: "ナムル", main: "もやし", sub: "にんじん", seasonings: ["塩", "ごま油", "酢"], genre: "韓国", category: "副菜", tags: ["時短", "節約", "ヘルシー"], tips: "野菜は茹ですぎないと食感が残ります。" },
  { title: "煮物", main: "じゃがいも", sub: "玉ねぎ", seasonings: ["醤油", "みりん", "砂糖"], genre: "和食", category: "主菜", tags: ["節約"], tips: "落とし蓋をすると味が均一にしみます。" },
  { title: "サラダ", main: "レタス", sub: "トマト", seasonings: ["塩", "こしょう", "酢", "サラダ油"], genre: "洋食", category: "副菜", tags: ["時短", "ヘルシー"], tips: "食べる直前に和えるとシャキッと仕上がります。" },
  { title: "パスタ", main: "パスタ", sub: "ベーコン", seasonings: ["塩", "こしょう", "オリーブオイル"], genre: "洋食", category: "主菜", tags: ["がっつり"], tips: "茹で汁を加えるとソースがよく絡みます。" },
];

const VARIATIONS = ["基本", "香味", "うま塩", "ピリ辛", "さっぱり", "濃厚", "にんにく", "生姜", "バター", "柚子こしょう"];

function createRecipe(template: BaseRecipeTemplate, variation: string, index: number): Recipe {
  return {
    id: `recipe_${String(index + 1).padStart(3, "0")}`,
    name: `${template.main}と${template.sub}の${variation}${template.title}`,
    servings: index % 3 === 0 ? 1 : 2,
    ingredients: [template.main, template.sub, ...template.seasonings],
    steps: [
      `${template.main}と${template.sub}を食べやすく切る。`,
      `フライパンまたは鍋を温め、材料を順に加える。`,
      `${variation}の風味を出すように調味料を加える。`,
      `全体を混ぜ合わせ、火が通ったら完成。`,
    ],
    cookingTime: 8 + (index % 5) * 4,
    difficulty: index % 4 === 0 ? "中級" : "初級",
    tags: template.tags,
    genre: template.genre,
    category: template.category,
    tips: template.tips,
  };
}

export const RECIPES: Recipe[] = BASE_TEMPLATES.flatMap((template, templateIndex) =>
  VARIATIONS.map((variation, variationIndex) =>
    createRecipe(template, variation, templateIndex * VARIATIONS.length + variationIndex)
  )
);
