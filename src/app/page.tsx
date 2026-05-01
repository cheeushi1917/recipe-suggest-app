"use client";

import { useMemo, useState } from "react";
import { RECIPES, type Recipe, type Tag } from "./recipes";

type SuggestedRecipe = Recipe & {
  availableIngredients: string[];
  missingIngredients: string[];
  matchedUserIngredients: string[];
  score: number;
};

const TAGS: Tag[] = ["時短", "節約", "がっつり", "ヘルシー"];
const MAX_SUGGESTIONS = 20;

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
  userIngredients: string[],
  selectedTags: Tag[]
): number {
  const missingIngredients = getMissingIngredients(
    recipe.ingredients,
    availableIngredients
  );

  const matchedUserIngredients = getAvailableIngredients(
    recipe.ingredients,
    userIngredients
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

  if (matchedUserIngredients.length === 0) score -= 40;
  else score += matchedUserIngredients.length * 15;

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

      const score = calculateScore(
        recipe,
        availableIngredients,
        userIngredients,
        selectedTags
      );

      const matchedUserIngredients = getAvailableIngredients(
        recipe.ingredients,
        userIngredients
      );

      return {
        ...recipe,
        availableIngredients: availableRecipeIngredients,
        missingIngredients,
        score,
        matchedUserIngredients,
      };
    })
      .filter(
        (recipe) =>
          recipe.missingIngredients.length <= 2 &&
          recipe.matchedUserIngredients.length > 0
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_SUGGESTIONS);
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
            <h2 className="mb-1 text-xl font-bold">おすすめレシピ</h2>
            <p className="mb-3 text-sm text-slate-600">表示件数: {suggestedRecipes.length}件（最大{MAX_SUGGESTIONS}件）</p>

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