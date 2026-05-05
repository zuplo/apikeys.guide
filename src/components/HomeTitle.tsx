/**
 * Homepage-only <title> override.
 *
 * Zudoku's global titleTemplate is "%s | apikeys.guide" (set in
 * zudoku.config.tsx), which on the root doc would render as
 * "What Are API Keys? | apikeys.guide". For the homepage we want a bare
 * "apikeys.guide". react-helmet-async lets a nested Helmet override the
 * inherited titleTemplate, so we render one with template "%s" and the
 * literal site name.
 */
import { Head } from "zudoku/components";

export function HomeTitle() {
  return (
    <Head titleTemplate="%s">
      <title>apikeys.guide</title>
    </Head>
  );
}

export default HomeTitle;
