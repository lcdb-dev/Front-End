import { stripHtml } from "./stripHtml";

export function buildRecipeJsonLd(recipe) {
  // Build canonical URL dynamically based on environment
  const isDev = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';
  const baseUrl = isDev ? 'http://localhost:4321' : 'https://lacuisinedebernard.com';
  const canonical = `${baseUrl}/${recipe.slug}`;

  const ingredients = recipe.ingredients_flat
    ?.filter(i => i.type === "ingredient")
    .map(i => {
      const qty = [i.amount, i.unit].filter(Boolean).join(" ");
      return `${qty} ${i.name}`.trim();
    }) || [];

  const instructions = recipe.instructions_flat?.map((step, index) => ({
    "@type": "HowToStep",
    "position": index + 1,
    "text": stripHtml(step.text)
  })) || [];

  const nutrition = recipe.nutrition
    ? {
        "@type": "NutritionInformation",
        "calories": recipe.nutrition.calories,
        "fatContent": recipe.nutrition.fat,
        "carbohydrateContent": recipe.nutrition.carbohydrates,
        "proteinContent": recipe.nutrition.protein,
        "fiberContent": recipe.nutrition.fiber,
        "sugarContent": recipe.nutrition.sugar,
        "sodiumContent": recipe.nutrition.sodium
      }
    : undefined;

  const rating =
    recipe.rating_count > 0
      ? {
          "@type": "AggregateRating",
          "ratingValue": recipe.rating_average,
          "ratingCount": recipe.rating_count
        }
      : undefined;

  const video = recipe.video?.url
    ? {
        "@type": "VideoObject",
        "name": recipe.name,
        "description": stripHtml(recipe.summary),
        "thumbnailUrl": recipe.video.thumbnail,
        "uploadDate": recipe.video.upload_date,
        "contentUrl": recipe.video.url
      }
    : undefined;

  // Extract course and cuisine from tags if available
  const courseArray = recipe.tags?.course || [];
  const cuisineArray = recipe.tags?.cuisine || [];
  
  const recipeCategory = courseArray.length > 0 ? courseArray[0] : recipe.course || undefined;
  const recipeCuisine = cuisineArray.length > 0 ? cuisineArray[0] : recipe.cuisine || undefined;

  // Build image array - ensure at least one image from image_url
  let images = Array.isArray(recipe.images) ? recipe.images : [];
  if (!images.length && recipe.image_url) {
    images = [recipe.image_url];
  }

  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    "@id": `${canonical}#recipe`,

    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonical
    },

    "name": recipe.name,
    "description": stripHtml(recipe.summary) || recipe.name,
    "inLanguage": recipe.language,

    // CRITICAL: Image field - at least one required for rich results
    ...(images.length > 0 && {
      "image": images.length === 1 ? images[0] : images
    }),

    "author": {
      "@type": "Person",
      "name": "Bernard"
    },

    "publisher": {
      "@type": "Organization",
      "name": "La Cuisine de Bernard",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`
      }
    },

    "datePublished": recipe.date,
    "dateModified": recipe.modified || recipe.date,

    "recipeYield": recipe.servings
      ? `${recipe.servings} ${recipe.servings_unit || ""}`.trim()
      : undefined,

    "prepTime": recipe.prep_time ? `PT${recipe.prep_time}M` : undefined,
    "cookTime": recipe.cook_time ? `PT${recipe.cook_time}M` : undefined,
    "totalTime":
      recipe.prep_time || recipe.cook_time
        ? `PT${Number(recipe.prep_time || 0) + Number(recipe.cook_time || 0)}M`
        : undefined,

    // IMPORTANT: Category and Cuisine fields
    ...(recipeCategory && { "recipeCategory": recipeCategory }),
    ...(recipeCuisine && { "recipeCuisine": recipeCuisine }),
    
    "keywords": Array.isArray(recipe.tags?.keyword) 
      ? recipe.tags.keyword.join(", ") 
      : (typeof recipe.tags === "string" ? recipe.tags : ""),

    "recipeIngredient": ingredients,
    "recipeInstructions": instructions,

    // Optional fields - only include if available
    ...(nutrition && { "nutrition": nutrition }),
    ...(rating && { "aggregateRating": rating }),
    ...(video && { "video": video })
  };
}
