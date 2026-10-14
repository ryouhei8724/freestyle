import { diagram } from './lib.mjs';

// ── 3.1 楽観的同時実行制御でのコミット ─────────────────────────
diagram(
  'occ',
  {
    w: 960,
    h: 590,
    minWidth: 720,
    title: '2つの writer が同じ v41 から書き始め、先にコミットした A が v42 を作り、B は競合チェックのうえ v43 として再試行する流れ',
    caption:
      '楽観的同時実行制御（OCC）でのコミット。A と B はどちらも v41 を読んでデータファイルを書く。書いただけのファイルはどこからも参照されないので誰にも見えない。先に「v41 → v42」の切り替えに成功した A が勝ち、B の切り替えは失敗する。B は A の変更と自分の読んだ範囲が重ならないかを確かめ、重ならなければ v43 として再試行する。この間も、読み手は v41 や v42 を最後まで一貫して読める。',
  },
  g => {
    g.node(70, 20, 160, 44, [['Writer A', 'tx-b']]);
    g.node(370, 20, 220, 44, [['ストレージ／カタログ', 'tx-s tx-b'], ['最初の現在版 ＝ v41', 'tx-xs']], { cls: 'ac' });
    g.node(730, 20, 160, 44, [['Writer B', 'tx-b']]);
    [150, 480, 810].forEach(x => g.line(x, 64, x, 575, 'thin dash'));

    g.arrow([[478, 100], [152, 100]]);
    g.label(315, 88, '① v41 を読む', 'tx-s', 'middle', 300);
    g.arrow([[482, 100], [808, 100]]);
    g.label(645, 88, '① v41 を読む', 'tx-s', 'middle', 300);

    g.arrow([[152, 150], [478, 150]]);
    g.label(315, 138, '② part-a.parquet を書く', 'tx-s', 'middle', 300);
    g.label(315, 162, 'まだ誰からも見えない', 'tx-xs', 'middle', 300);
    g.arrow([[808, 196], [482, 196]]);
    g.label(645, 184, '② part-b.parquet を書く', 'tx-s', 'middle', 300);

    g.arrow([[152, 250], [478, 250]], { cls: 'ok' });
    g.label(315, 238, '③ v41 → v42 をアトミックに作成', 'tx-s tx-b', 'middle', 300);
    g.arrow([[478, 282], [152, 282]], { cls: 'ok dash' });
    g.label(315, 270, '成功', 'tx-xs tx-ok tx-b');
    g.node(420, 294, 120, 30, [['現在 ＝ v42', 'tx-xs tx-b']], { cls: 'ac' });

    g.arrow([[808, 350], [482, 350]], { cls: 'bad' });
    g.label(645, 338, '③ v41 → v42 を作成', 'tx-s tx-b', 'middle', 300);
    g.arrow([[482, 382], [808, 382]], { cls: 'bad dash' });
    g.label(645, 370, '失敗：v42 は既にある', 'tx-xs tx-bad tx-b', 'middle', 300);

    g.node(716, 400, 188, 66, [['④ 競合チェック', 'tx-s tx-b'], ['A が書き換えたファイルと', 'tx-xs'], ['自分が読んだ範囲は重なる？', 'tx-xs']], { cls: 'wm' });

    g.arrow([[808, 500], [482, 500]], { cls: 'ok' });
    g.label(645, 488, '⑤ 重ならなければ v43 として再試行', 'tx-s tx-b', 'middle', 300);
    g.arrow([[482, 530], [808, 530]], { cls: 'ok dash' });
    g.label(645, 518, '成功', 'tx-xs tx-ok tx-b');
    g.node(420, 542, 120, 30, [['現在 ＝ v43', 'tx-xs tx-b']], { cls: 'ac' });
  },
);

// ── 3.2 Delta Lake のトランザクションログ ──────────────────────
diagram(
  'delta-log',
  {
    w: 1000,
    h: 352,
    minWidth: 780,
    title: 'Delta Lake は最新のチェックポイントにその後のJSONコミットを順に適用して現在のファイル集合を求め、新しいコミットは put-if-absent で作る',
    caption:
      '上：_delta_log の中身。_last_checkpoint が最新のチェックポイント（v40）を指す。中：v42 の状態は、v40 のチェックポイントに 41.json と 42.json を順に適用し、「add されて remove されていないファイル」を残して求める。下：新しいコミットは次の番号のファイルを put-if-absent で作る。先に作られていれば失敗し、競合を確かめて次の番号で再試行する。',
  },
  g => {
    g.t(20, 24, 'orders/_delta_log/', 'tx-s tx-mono tx-b', 'start');
    g.node(20, 44, 130, 42, [['00…00.json', 'tx-xs tx-mono']]);
    g.t(175, 65, '…', 'tx-b');
    g.node(200, 44, 200, 42, [['00…40.checkpoint.parquet', 'tx-xs tx-mono']], { cls: 'wm' });
    g.node(420, 44, 130, 42, [['00…41.json', 'tx-xs tx-mono']]);
    g.node(570, 44, 130, 42, [['00…42.json', 'tx-xs tx-mono']]);
    g.node(780, 44, 170, 42, [['_last_checkpoint', 'tx-xs tx-mono']], { cls: 'mu' });
    g.path('M865,44 V30 H300 V42', { cls: 'wm' });
    g.t(582, 16, '最新のチェックポイント（40）を指す', 'tx-xs', 'middle', 300);

    g.arrow([[300, 86], [130, 128]], { cls: 'dash' });
    g.arrow([[485, 86], [384, 128]], { cls: 'dash' });
    g.arrow([[635, 86], [628, 128]], { cls: 'dash' });
    g.node(20, 130, 220, 96, [['チェックポイント v40', 'tx-s tx-b'], ['add: A, B, C, D', 'tx-s tx-mono']], { cls: 'wm' });
    g.t(262, 178, '＋', 'tx-h');
    g.node(284, 130, 200, 96, [['41.json', 'tx-s tx-b tx-mono'], ['add: E', 'tx-s tx-mono'], ['remove: B', 'tx-s tx-mono']]);
    g.t(506, 178, '＋', 'tx-h');
    g.node(528, 130, 200, 96, [['42.json', 'tx-s tx-b tx-mono'], ['add: F', 'tx-s tx-mono'], ['remove: C', 'tx-s tx-mono']]);
    g.arrow([[732, 178], [770, 178]], { cls: 'ac' });
    g.node(772, 130, 208, 96, [['v42 のテーブル', 'tx-s tx-b'], ['A, D, E, F', 'tx-s tx-mono tx-b'], ['add から remove を除いた残り', 'tx-xs']], { cls: 'ac' });

    g.node(20, 270, 220, 60, [['Writer（新しいコミット）', 'tx-s tx-b'], ['次は 43 番を作りたい', 'tx-xs']]);
    g.arrow([[240, 300], [338, 300]], { cls: 'ac' });
    g.t(289, 284, 'put-if-absent', 'tx-xs tx-mono');
    g.node(340, 270, 284, 60, [['00…43.json が無ければ作成', 'tx-s'], ['→ 成功＝コミット確定', 'tx-xs tx-ok tx-b']], { cls: 'ok' });
    g.node(640, 270, 340, 60, [['先に作られていたら失敗', 'tx-s'], ['→ 競合を確かめて 00…44.json で再試行', 'tx-xs tx-bad']], { cls: 'bad' });
  },
);

// ── 3.3 Iceberg のメタデータツリーと3段階の絞り込み ───────────────
diagram(
  'iceberg-tree',
  {
    w: 1000,
    h: 540,
    minWidth: 800,
    title: 'Iceberg のカタログ、metadata.json、manifest list、manifest、データファイルの木構造と、各段階でのデータの絞り込み',
    caption:
      'Iceberg の木構造。カタログが持つのは「現在の metadata.json の場所」という唯一の可変ポインタで、これを CAS で差し替えることがコミットになる。クエリ計画では、manifest list のパーティション範囲で manifest ごと除外し、manifest の列統計でファイルを除外し、最後に Parquet の footer で Row Group を除外する。どの段階でも LIST は発生しない。',
  },
  g => {
    g.node(70, 20, 400, 56, [['カタログ（REST・Glue・HMS など）', 'tx-s tx-b'], ['db.orders → …/00042-….metadata.json', 'tx-xs tx-mono']], { cls: 'ac' });
    g.arrow([[270, 76], [270, 104]]);
    g.node(70, 106, 400, 56, [['metadata.json', 'tx-s tx-b tx-mono'], ['スキーマ・パーティション仕様・スナップショット一覧', 'tx-xs']]);
    g.arrow([[270, 162], [270, 190]]);
    g.node(70, 192, 400, 56, [['manifest list（snap-….avro）', 'tx-s tx-b'], ['manifest ごとのパーティション値の範囲', 'tx-xs']]);
    g.arrow([[170, 248], [100, 288]]);
    g.arrow([[270, 248], [270, 288]], { cls: 'dash' });
    g.arrow([[370, 248], [440, 288]]);
    g.node(20, 290, 160, 56, [['manifest A', 'tx-s tx-b'], ['06-01〜06-03', 'tx-xs']]);
    g.node(190, 290, 160, 56, [['manifest B', 'tx-s tx-b'], ['05-01〜05-31', 'tx-xs']], { cls: 'mu' });
    g.cross(334, 304, 6);
    g.node(360, 290, 160, 56, [['manifest C', 'tx-s tx-b'], ['06-04〜06-06', 'tx-xs']]);
    const files = [
      [20, 'f1', 'ac'], [75, 'f2', 'x'], [130, 'f3', 'ac'],
      [195, 'f4', 'mu'], [250, 'f5', 'mu'], [305, 'f6', 'mu'],
      [365, 'f7', 'ac'], [420, 'f8', 'x'], [475, 'f9', 'x'],
    ];
    files.forEach(([x, name, state], i) => {
      const parent = i < 3 ? 100 : i < 6 ? 270 : 440;
      g.line(parent, 346, x + 25, 386, state === 'mu' ? 'thin dash' : 'thin');
      g.node(x, 388, 50, 44, [[name, 'tx-xs tx-mono']], { cls: state === 'ac' ? 'ac' : 'mu', pad: 4 });
      if (state === 'x') g.cross(x + 41, 397, 5);
    });

    g.arrow([[552, 48], [474, 48]], { cls: 'ac' });
    g.lines(560, 48, [['唯一の可変ポインタ', 'tx-s tx-b tx-ac'], ['CAS で差し替える ＝ コミット', 'tx-xs']], { anchor: 'start', max: 420 });
    g.arrow([[552, 134], [474, 134]]);
    g.lines(560, 134, [['テーブルの定義と全履歴', 'tx-s tx-b'], ['current-snapshot-id が現在版を指す', 'tx-xs']], { anchor: 'start', max: 420 });
    g.arrow([[552, 220], [474, 220]], { cls: 'wm' });
    g.lines(560, 220, [['① 範囲が合わない manifest を丸ごと除外', 'tx-s tx-b tx-wm'], ['manifest 3個 → 2個（WHERE ts >= 06-01）', 'tx-xs']], { anchor: 'start', max: 420 });
    g.arrow([[552, 318], [524, 318]], { cls: 'wm' });
    g.lines(560, 318, [['② ファイルごとの min・max でさらに除外', 'tx-s tx-b tx-wm'], ['候補のデータファイル 6個 → 3個', 'tx-xs']], { anchor: 'start', max: 420 });
    g.arrow([[552, 410], [529, 410]], { cls: 'wm' });
    g.lines(560, 410, [['③ Parquet の footer で Row Group 単位に除外', 'tx-s tx-b tx-wm'], ['ページインデックスがあればページ単位まで', 'tx-xs']], { anchor: 'start', max: 420 });

    g.node(20, 466, 960, 52, [['LIST は一度も発生しない。ファイルのパスも統計もメタデータにあるので、数百万ファイルでも計画は数秒以内に終わる', 'tx-s tx-b']], { cls: 'ac' });
  },
);

// ── 3.3 Hidden Partitioning とパーティション進化 ─────────────────
diagram(
  'hidden-partition',
  {
    w: 1000,
    h: 430,
    minWidth: 800,
    title: 'Hive では利用者がパーティション列を指定しないとフルスキャンになり、Iceberg は変換関数で自動的に絞り込み、パーティション仕様を変えても既存データを書き直さない',
    caption:
      '上：Hive では dt 列を書き込み側が計算して入れ、読み手もクエリで dt を指定しないと全パーティションを読んでしまう。Iceberg は days(ts) などの変換関数でパーティションを定義するので、ts で絞るだけで自動的に絞り込まれる。下：パーティション進化。仕様を日単位から時間単位に変えても既存ファイルは書き直さず、ファイルごとに自分が書かれた時点の仕様を持つ。',
  },
  g => {
    g.t(250, 24, 'Hive：パーティション列を人が管理', 'tx-h', 'middle', 460);
    g.node(40, 48, 420, 52, [['orders（order_id, ts, amount, dt STRING）', 'tx-s tx-mono'], ['dt は書き込み側が ts から計算して入れる', 'tx-xs']]);
    g.node(40, 112, 420, 50, [["WHERE ts >= '06-01' AND dt = '2024-06-01'", 'tx-xs tx-mono'], ['→ パーティションを絞れる', 'tx-xs tx-ok tx-b']], { cls: 'ok' });
    g.node(40, 172, 420, 50, [["WHERE ts >= '06-01'（dt を書き忘れ）", 'tx-xs tx-mono'], ['→ 全パーティションをスキャン', 'tx-xs tx-bad tx-b']], { cls: 'bad' });

    g.line(500, 36, 500, 226, 'thin dash');

    g.t(750, 24, 'Iceberg：変換関数で自動導出', 'tx-h', 'middle', 460);
    g.node(540, 48, 420, 52, [['PARTITIONED BY (days(ts), bucket(16, order_id))', 'tx-xs tx-mono'], ['パーティションの値は ts から自動で計算される', 'tx-xs']]);
    g.node(540, 112, 420, 50, [["WHERE ts >= '2024-06-01 00:00'", 'tx-xs tx-mono'], ['→ days(ts) に変換して自動で絞り込む', 'tx-xs tx-ok tx-b']], { cls: 'ok' });
    g.node(540, 172, 420, 50, [['利用者はパーティションの存在を', 'tx-xs'], ['意識しなくてよい（hidden partitioning）', 'tx-xs']]);

    g.t(500, 262, 'パーティション進化：仕様を変えても既存データは書き直さない', 'tx-s tx-b', 'middle', 900);
    g.t(260, 290, 'spec #0：days(ts) で書かれたファイル', 'tx-xs', 'middle', 420);
    g.t(724, 290, 'spec #1：hours(ts) で書かれたファイル', 'tx-xs tx-ac', 'middle', 420);
    ['day=06-01', 'day=06-02', 'day=06-03', 'day=06-04'].forEach((d, i) => g.node(70 + i * 96, 304, 86, 40, [[d, 'tx-xs tx-mono']], { pad: 4 }));
    ['hour=05T00', 'hour=05T01', 'hour=05T02', 'hour=05T03'].forEach((d, i) => g.node(530 + i * 98, 304, 90, 40, [[d, 'tx-xs tx-mono']], { cls: 'ac', pad: 4 }));
    g.line(500, 280, 500, 392, 'wm');
    g.arrow([[40, 382], [960, 382]]);
    g.label(500, 362, '日付をまたぐクエリは、ファイルごとに自分の仕様で絞り込む', 'tx-xs tx-b', 'middle', 600);
    g.label(500, 406, 'ALTER TABLE … でこの時点から hours(ts) に変更', 'tx-xs tx-wm tx-b', 'middle', 600);
    g.t(960, 406, '時間', 'tx-xs', 'end');
  },
);

// ── 3.3 列を名前でなく ID で識別する ───────────────────────────
diagram(
  'schema-evolution',
  {
    w: 1000,
    h: 312,
    minWidth: 780,
    title: '列を名前で対応付けると改名で値が NULL になり削除した値が復活するが、ID で対応付けると正しく読める',
    caption:
      '操作は「price を amount に改名」「note を削除して、同じ名前の note を新しく追加」の2つ。左：名前で対応付けると、古いファイルに amount という列はないので値が全部 NULL になり、新しい note には削除したはずの古い値が現れる。右：Iceberg は列に ID を振るので、amount は ID #2 で古い price の値を正しく読み、新しい note（#4）は古いファイルでは正しく空になる。',
  },
  g => {
    g.t(500, 22, '操作：price → amount に改名 ／ note を削除して同名の note を追加', 'tx-s tx-b', 'middle', 900);

    const panel = (x0, title, schema, file, links, outcome) => {
      g.t(x0 + 230, 56, title, 'tx-h', 'middle', 440);
      g.t(x0 + 90, 84, '現在のスキーマ', 'tx-xs tx-b');
      g.t(x0 + 370, 84, '古いファイル', 'tx-xs tx-b');
      schema.forEach((s, i) => g.node(x0 + 20, 100 + i * 46, 140, 36, [[s, 'tx-s tx-mono']]));
      file.forEach(([s, cls], i) => g.node(x0 + 300, 100 + i * 46, 140, 36, [[s, 'tx-s tx-mono']], { cls }));
      links.forEach(([i, j, cls]) => {
        const y1 = 118 + i * 46;
        if (j == null) {
          g.line(x0 + 160, y1, x0 + 212, y1, cls);
          g.cross(x0 + 224, y1, 6, cls);
          g.t(x0 + 236, y1, 'NULL', `tx-xs tx-b tx-${cls}`, 'start');
        } else {
          g.arrow([[x0 + 160, y1], [x0 + 298, 118 + j * 46]], { cls });
        }
      });
      g.lines(x0 + 230, 270, outcome, { max: 440 });
    };
    panel(
      20,
      '名前で対応付け（Hive 流）',
      ['id', 'amount', 'note（新）'],
      [['id', ''], ['price', ''], ['note（旧）', 'wm']],
      [[0, 0, 'ok'], [1, null, 'bad'], [2, 2, 'bad']],
      [['amount は古いデータが全部 NULL になる', 'tx-s tx-bad'], ['新しい note に削除したはずの値が復活', 'tx-s tx-bad']],
    );
    g.line(500, 44, 500, 300, 'thin dash');
    panel(
      520,
      'ID で対応付け（Iceberg）',
      ['id　#1', 'amount　#2', 'note　#4'],
      [['id　#1', ''], ['price　#2', ''], ['note　#3', 'mu']],
      [[0, 0, 'ok'], [1, 1, 'ok'], [2, null, 'ok']],
      [['改名しても ID #2 で正しく読める', 'tx-s tx-ok'], ['新しい note（#4）は古いファイルでは正しく空', 'tx-s tx-ok']],
    );
  },
);

// ── 3.4 Hudi のタイムラインと Merge-on-Read ─────────────────────
diagram(
  'hudi',
  {
    w: 1000,
    h: 400,
    minWidth: 800,
    title: 'Hudi のタイムラインに並ぶ instant と、レコードキー索引で更新先を特定し、base と log を compaction でまとめる Merge-on-Read の構造',
    caption:
      '上：.hoodie/ のタイムライン。instant は「時刻・操作・状態」の組で、requested → inflight → completed と進む。下：upsert ではレコードキー索引で更新先の file group を特定する。Merge-on-Read では、更新を log ファイルとして追記し、読み手が base とその場でマージする。compaction で新しい base にまとめる。読み方は3通りある。',
  },
  g => {
    g.t(20, 22, '.hoodie/ のタイムライン（instant ＝ 時刻 ＋ 操作 ＋ 状態）', 'tx-s tx-b', 'start', 700);
    g.arrow([[40, 80], [960, 80]]);
    const instants = [
      [120, 't1 commit', 'completed', 'dot'],
      [260, 't2 deltacommit', 'completed', 'dot'],
      [400, 't3 deltacommit', 'completed', 'dot'],
      [540, 't4 compaction', 'completed', 'dot ac'],
      [680, 't5 deltacommit', 'inflight', 'dot wm'],
      [820, 't6 clean', 'requested', 'fill-mu'],
    ];
    instants.forEach(([x, name, state, cls]) => {
      g.circle(x, 80, 7, cls);
      g.t(x, 56, name, 'tx-xs tx-b tx-mono', 'middle', 130);
      g.t(x, 104, state, 'tx-xs' + (state === 'inflight' ? ' tx-wm' : ''), 'middle', 130);
    });

    g.node(20, 300, 210, 56, [['upsert（key=u42 の更新）', 'tx-xs tx-b'], ['どのファイルにあるかを索引で特定', 'tx-xs']]);
    g.arrow([[125, 300], [125, 262]]);
    g.node(20, 160, 210, 100, [['レコードキー索引', 'tx-s tx-b'], ['key=u42', 'tx-xs tx-mono'], ['→ file group 7', 'tx-xs tx-mono']], { cls: 'ac' });
    g.arrow([[230, 210], [268, 210]], { cls: 'ac' });

    g.box(270, 140, 510, 236);
    g.t(286, 158, 'file group 7（Merge-on-Read テーブル）', 'tx-s tx-b', 'start', 480);
    g.node(290, 178, 170, 62, [['base（Parquet）', 'tx-s tx-b'], ['t1 時点', 'tx-xs']]);
    g.node(476, 178, 140, 62, [['log（Avro）', 'tx-s tx-b'], ['t2 の差分', 'tx-xs']], { cls: 'wm' });
    g.node(626, 178, 140, 62, [['log（Avro）', 'tx-s tx-b'], ['t3 の差分', 'tx-xs']], { cls: 'wm' });
    g.arrow([[375, 240], [500, 300]], { cls: 'ac' });
    g.arrow([[546, 240], [560, 300]], { cls: 'ac' });
    g.arrow([[696, 240], [620, 300]], { cls: 'ac' });
    g.label(452, 262, 'compaction', 'tx-xs tx-ac tx-b');
    g.node(450, 302, 220, 58, [['新しい base（Parquet）', 'tx-s tx-b'], ['t4 の compaction で生成', 'tx-xs']], { cls: 'ac' });

    g.t(884, 158, '3通りの読み方', 'tx-xs tx-b');
    g.node(800, 172, 168, 66, [['スナップショット読み取り', 'tx-xs tx-b'], ['base ＋ log を', 'tx-xs'], ['その場でマージ', 'tx-xs']], { pad: 5 });
    g.node(800, 246, 168, 56, [['読み取り最適化', 'tx-xs tx-b'], ['base だけ読む（速い）', 'tx-xs']]);
    g.node(800, 310, 168, 56, [['増分クエリ', 'tx-xs tx-b'], ['t2 以降の変更だけ', 'tx-xs']]);
  },
);

// ── 3.6 Copy-on-Write と Merge-on-Read ─────────────────────────
diagram(
  'cow-mor',
  {
    w: 1000,
    h: 384,
    minWidth: 780,
    title: '1行の更新に対して、Copy-on-Write はファイル全体を書き直し、Merge-on-Read は差分だけを書いて読むときにマージする',
    caption:
      '100万行のファイルにある1行を UPDATE する場合。Copy-on-Write はファイルを丸ごと書き直すので書き込みは重いが、読み取りは新しいファイルを読むだけで済む。Merge-on-Read は削除ベクトル（どの行が無効かを示すビットマップ）と新しい行だけを書くので書き込みは軽いが、読むたびにマージが必要になり、定期的な compaction が欠かせない。',
  },
  g => {
    g.t(500, 20, '100万行のファイルにある1行を UPDATE する', 'tx-s tx-b', 'middle', 900);
    g.t(365, 50, '書き込み時', 'tx-b');
    g.t(800, 50, '読み取り時', 'tx-b');
    g.node(20, 88, 130, 84, [['Copy-on-Write', 'tx-s tx-b'], ['（CoW）', 'tx-xs']], { cls: 'mu' });
    g.node(170, 100, 130, 60, [['file-1', 'tx-s tx-mono'], ['100万行', 'tx-xs']]);
    g.arrow([[300, 130], [398, 130]], { cls: 'wm' });
    g.label(349, 116, '丸ごと', 'tx-xs tx-b');
    g.node(400, 100, 150, 60, [['file-1′', 'tx-s tx-mono'], ['100万行（新しく）', 'tx-xs']], { cls: 'wm' });
    g.t(365, 184, '1行のために100万行を書く（書き込み増幅）', 'tx-xs tx-wm', 'middle', 380);
    g.node(620, 100, 160, 60, [['file-1′ だけを読む', 'tx-s']], { cls: 'ok' });
    g.lines(880, 130, [['速い・単純', 'tx-s tx-ok tx-b'], ['分析中心向き', 'tx-xs']], { max: 190 });

    g.line(20, 206, 980, 206, 'thin dash');

    g.node(20, 228, 130, 104, [['Merge-on-Read', 'tx-s tx-b'], ['（MoR）', 'tx-xs']], { cls: 'mu' });
    g.node(170, 250, 130, 60, [['file-1', 'tx-s tx-mono'], ['そのまま', 'tx-xs']]);
    g.arrow([[300, 268], [398, 248]], { cls: 'ok' });
    g.arrow([[300, 292], [398, 304]], { cls: 'ok' });
    g.node(400, 226, 150, 46, [['削除ベクトル', 'tx-xs tx-b'], ['行 #4711 を無効に', 'tx-xs']], { cls: 'wm' });
    g.node(400, 282, 150, 46, [['新しい1行', 'tx-xs tx-b'], ['小さなファイル', 'tx-xs']], { cls: 'wm' });
    g.t(365, 348, '差分だけ書く（書き込みは小さく速い）', 'tx-xs tx-ok', 'middle', 380);
    g.node(620, 228, 160, 100, [['file-1', 'tx-xs tx-mono'], ['− 削除ベクトル', 'tx-xs'], ['＋ 新しい1行', 'tx-xs'], ['をその場でマージ', 'tx-xs']]);
    g.lines(880, 278, [['読むたびにマージ', 'tx-s tx-wm tx-b'], ['差分が溜まると遅くなる', 'tx-xs']], { max: 190 });
    g.t(500, 372, '→ 定期的な compaction で base を作り直し、差分を消す', 'tx-xs tx-b', 'middle', 900);
  },
);
