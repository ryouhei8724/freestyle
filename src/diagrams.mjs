// 図の定義は src/diagrams/ 配下。読み込むと diagrams に登録される。
import './diagrams/intro-history.mjs';
import './diagrams/mechanics.mjs';
import './diagrams/compare.mjs';

export { diagrams, warnings } from './diagrams/lib.mjs';
