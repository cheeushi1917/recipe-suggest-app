"use client";

import { useMemo, useState } from "react";

type Tag = "時短" | "節約" | "がっつり" | "ヘルシー";
type Difficulty = "初級" | "中級";
type Recipe = {
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

type SuggestedRecipe = Recipe & {
  availableIngredients: string[];
  missingIngredients: string[];
  score: number;
};

const TAGS: Tag[] = ["時短", "節約", "がっつり", "ヘルシー"];

const DEFAULT_SEASONINGS = [
  "塩",
  "こしょう",
  "醤油",
  "砂糖",
  "みりん",
  "酒",
  "味噌",
  "酢",
  "サラダ油",
  "ごま油",
  "マヨネーズ",
];

const INGREDIENT_ALIASES: Record<string, string> = {
  豚こま: "豚肉",
  豚細切れ: "豚肉",
  豚切り落とし: "豚肉",
  豚バラ: "豚肉",
  たまねぎ: "玉ねぎ",
  玉ネギ: "玉ねぎ",
  ツナ缶: "ツナ",
  シーチキン: "ツナ",
};

const RECIPES: Recipe[] = [
  {
    id: "recipe_001",
    name: "豚こまと玉ねぎの卵とじ",
    servings: 2,
    ingredients: ["豚こま", "玉ねぎ", "卵", "醤油", "みりん", "砂糖"],
    steps: [
      "玉ねぎを薄切りにする。",
      "フライパンに油をひき、豚こまを中火で炒める。",
      "豚こまの色が変わったら玉ねぎを加える。",
      "醤油、みりん、砂糖を加えて軽く煮る。",
      "溶き卵を回し入れ、卵に火が通ったら完成。",
    ],
    cookingTime: 15,
    difficulty: "初級",
    tags: ["時短", "節約", "がっつり"],
    genre: "和食",
    category: "主菜",
    tips: "卵は最後に入れると、ふんわり仕上がります。",
  },
  {
    id: "recipe_002",
    name: "玉ねぎと卵の中華スープ",
    servings: 2,
    ingredients: ["玉ねぎ", "卵", "鶏ガラスープの素", "塩", "こしょう"],
    steps: [
      "玉ねぎを薄切りにする。",
      "鍋に水と玉ねぎを入れて中火で煮る。",
      "玉ねぎが柔らかくなったら鶏ガラスープの素を入れる。",
      "溶き卵を少しずつ回し入れる。",
      "塩こしょうで味を調えて完成。",
    ],
    cookingTime: 10,
    difficulty: "初級",
    tags: ["時短", "節約", "ヘルシー"],
    genre: "中華",
    category: "汁物",
    tips: "卵は少しずつ入れると、ふんわり広がります。",
  },
  {
    id: "recipe_003",
    name: "キャベツとツナのマヨ和え",
    servings: 2,
    ingredients: ["キャベツ", "ツナ", "マヨネーズ", "塩", "こしょう"],
    steps: [
      "キャベツを細切りにする。",
      "耐熱容器に入れて電子レンジで2分ほど加熱する。",
      "粗熱を取り、水気をしぼる。",
      "ツナ、マヨネーズ、塩こしょうを加えて混ぜる。",
      "味を調えたら完成。",
    ],
    cookingTime: 8,
    difficulty: "初級",
    tags: ["時短", "節約"],
    genre: "その他",
    category: "副菜",
    tips: "キャベツの水気をしっかり切ると、水っぽくなりにくいです。",
  },
  {
    id: "recipe_004",
    name: "豚こまとキャベツの味噌炒め",
    servings: 2,
    ingredients: ["豚こま", "キャベツ", "味噌", "みりん", "酒", "砂糖"],
    steps: [
      "キャベツを食べやすい大きさに切る。",
      "味噌、みりん、酒、砂糖を混ぜる。",
      "フライパンで豚こまを炒める。",
      "豚こまに火が通ったらキャベツを加える。",
      "合わせ調味料を加えて全体に絡めたら完成。",
    ],
    cookingTime: 15,
    difficulty: "初級",
    tags: ["時短", "節約", "がっつり"],
    genre: "和食",
    category: "主菜",
    tips: "キャベツは炒めすぎない方が食感が残ります。",
  },
  {
    id: "recipe_005",
    name: "卵チャーハン",
    servings: 1,
    ingredients: ["ご飯", "卵", "塩", "こしょう", "醤油", "ごま油"],
    steps: [
      "卵を溶いておく。",
      "フライパンにごま油をひき、卵を入れる。",
      "卵が半熟のうちにご飯を加えて炒める。",
      "塩こしょう、醤油で味を調える。",
      "全体がパラッとしたら完成。",
    ],
    cookingTime: 10,
    difficulty: "初級",
    tags: ["時短", "節約", "がっつり"],
    genre: "中華",
    category: "主菜",
    tips: "温かいご飯を使うと炒めやすいです。",
  },
];

function parseIngredients(input: string): string[] {
  return input
    .split(/[、,\s\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeIngredient(name: string): string {
  return INGREDIENT_ALIASES[name] ?? name;
}

function unique(items: string[]): string[] {
  return Array.from(new Set(items));
}

function getMissingIngredients(
  recipeIngredients: string[],
  availableIngredients: string[]
): string[] {
  const availableSet = new Set(
    availableIngredients.map((ingredient) => normalizeIngredient(ingredient))
  );

  return recipeIngredients.filter((ingredient) => {
    return !availableSet.has(normalizeIngredient(ingredient));
  });
}

function getAvailableIngredients(
  recipeIngredients: string[],
  availableIngredients: string[]
): string[] {
  const availableSet = new Set(
    availableIngredients.map((ingredient) => normalizeIngredient(ingredient))
  );

  return recipeIngredients.filter((ingredient) => {
    return availableSet.has(normalizeIngredient(ingredient));
  });
}

function calculateScore(
  recipe: Recipe,
  availableIngredients: string[],
  selectedTags: Tag[]
): number {
  const missingIngredients = getMissingIngredients(
    recipe.ingredients,
    availableIngredients
  );

  let score = 0;

  if (missingIngredients.length === 0) score += 50;
  else if (missingIngredients.length === 1) score += 30;
  else if (missingIngredients.length === 2) score += 15;
  else score -= 20;

  if (recipe.cookingTime <= 10) score += 25;
  else if (recipe.cookingTime <= 20) score += 15;
  else if (recipe.cookingTime <= 30) score += 5;

  if (recipe.difficulty === "初級") score += 10;

  const matchedTags = recipe.tags.filter((tag) => selectedTags.includes(tag));
  score += matchedTags.length * 10;

  return score;
}

export default function Home() {
  const [ingredientText, setIngredientText] = useState("卵、玉ねぎ、豚こま");
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  const userIngredients = useMemo(
    () => parseIngredients(ingredientText),
    [ingredientText]
  );

  const availableIngredients = useMemo(
    () => unique([...userIngredients, ...DEFAULT_SEASONINGS]),
    [userIngredients]
  );

  const suggestedRecipes: SuggestedRecipe[] = useMemo(() => {
    if (userIngredients.length === 0) return [];

    return RECIPES.map((recipe) => {
      const missingIngredients = getMissingIngredients(
        recipe.ingredients,
        availableIngredients
      );

      const availableRecipeIngredients = getAvailableIngredients(
        recipe.ingredients,
        availableIngredients
      );

      const score = calculateScore(recipe, availableIngredients, selectedTags);

      return {
        ...recipe,
        availableIngredients: availableRecipeIngredients,
        missingIngredients,
        score,
      };
    })
      .filter((recipe) => recipe.missingIngredients.length <= 2)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [userIngredients, availableIngredients, selectedTags]);

  const selectedRecipe = suggestedRecipes.find(
    (recipe) => recipe.id === selectedRecipeId
  );

  function toggleTag(tag: Tag) {
    setSelectedRecipeId(null);

    setSelectedTags((currentTags) => {
      if (currentTags.includes(tag)) {
        return currentTags.filter((currentTag) => currentTag !== tag);
      }

      return [...currentTags, tag];
    });
  }

  return (
    <main className="min-h-screen bg-orange-50 px-4 py-6 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <p className="text-sm font-semibold text-orange-600">
            冷蔵庫の食材からレシピ提案
          </p>
          <h1 className="mt-2 text-3xl font-bold">今日なに作る？</h1>
          <p className="mt-2 text-sm text-slate-600">
            食材を入力すると、今ある材料で作れるレシピや、少ない買い足しで作れるレシピを表示します。
          </p>
        </header>

        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <label className="block text-sm font-semibold">
            冷蔵庫にある食材
          </label>

          <textarea
            value={ingredientText}
            onChange={(event) => {
              setIngredientText(event.target.value);
              setSelectedRecipeId(null);
            }}
            className="mt-2 h-24 w-full rounded-2xl border border-slate-200 p-3 text-base outline-none focus:border-orange-400"
            placeholder="例：卵、玉ねぎ、豚こま"
          />

          <div className="mt-4">
            <p className="text-sm font-semibold">条件</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);

                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${
                      isSelected
                        ? "bg-orange-500 text-white"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">常備調味料</p>
            <p className="mt-1">{DEFAULT_SEASONINGS.join("、")}</p>
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <div>
            <h2 className="mb-3 text-xl font-bold">おすすめレシピ</h2>

            {suggestedRecipes.length === 0 && (
              <div className="rounded-3xl bg-white p-5 text-sm text-slate-600 shadow-sm">
                条件に合うレシピが見つかりませんでした。食材を追加してください。
              </div>
            )}

            <div className="space-y-3">
              {suggestedRecipes.map((recipe, index) => (
                <article
                  key={recipe.id}
                  className="rounded-3xl bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-orange-600">
                        おすすめ {index + 1}
                      </p>
                      <h3 className="mt-1 text-lg font-bold">{recipe.name}</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {recipe.cookingTime}分 / {recipe.difficulty} /{" "}
                        {recipe.servings}人分
                      </p>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
                      score {recipe.score}
                    </span>
                  </div>

                  <div className="mt-3 text-sm">
                    <p>
                      <span className="font-semibold">今ある材料：</span>
                      {recipe.availableIngredients.length > 0
                        ? recipe.availableIngredients.join("、")
                        : "なし"}
                    </p>
                    <p className="mt-1">
                      <span className="font-semibold">足りない材料：</span>
                      {recipe.missingIngredients.length > 0
                        ? recipe.missingIngredients.join("、")
                        : "なし"}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {recipe.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedRecipeId(recipe.id)}
                    className="mt-4 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                  >
                    詳細を見る
                  </button>
                </article>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-xl font-bold">レシピ詳細</h2>

            {!selectedRecipe && (
              <div className="rounded-3xl bg-white p-5 text-sm text-slate-600 shadow-sm">
                左側のレシピから「詳細を見る」を押してください。
              </div>
            )}

            {selectedRecipe && (
              <article className="rounded-3xl bg-white p-5 shadow-sm">
                <h3 className="text-2xl font-bold">{selectedRecipe.name}</h3>
                <p className="mt-2 text-sm text-slate-600">
                  {selectedRecipe.servings}人分 / 調理時間{" "}
                  {selectedRecipe.cookingTime}分 / 難易度{" "}
                  {selectedRecipe.difficulty}
                </p>

                <div className="mt-5">
                  <h4 className="font-bold">必要材料</h4>
                  <ul className="mt-2 list-inside list-disc text-sm text-slate-700">
                    {selectedRecipe.ingredients.map((ingredient) => (
                      <li key={ingredient}>{ingredient}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5">
                  <h4 className="font-bold">足りない材料</h4>
                  <p className="mt-2 text-sm text-slate-700">
                    {selectedRecipe.missingIngredients.length > 0
                      ? selectedRecipe.missingIngredients.join("、")
                      : "なし"}
                  </p>
                </div>

                <div className="mt-5">
                  <h4 className="font-bold">作り方</h4>
                  <ol className="mt-2 list-inside list-decimal space-y-2 text-sm text-slate-700">
                    {selectedRecipe.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>

                <div className="mt-5 rounded-2xl bg-orange-50 p-4">
                  <h4 className="font-bold">ポイント・コツ</h4>
                  <p className="mt-2 text-sm text-slate-700">
                    {selectedRecipe.tips}
                  </p>
                </div>
              </article>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}