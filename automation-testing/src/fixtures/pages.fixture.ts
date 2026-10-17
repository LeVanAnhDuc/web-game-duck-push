import { GamePage } from "@/pages/game.page";
import { test as core } from "./core.fixture";

// One fixture per page object, named like the class in camelCase. The game is a single route with two screens (Home,
// Play) swapped by state, so GamePage covers both and carries the win dialog as a property.
export const test = core.extend<{ gamePage: GamePage }>({
  gamePage: async ({ page }, use) => use(new GamePage(page)),
});
