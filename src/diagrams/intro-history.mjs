import { diagram } from './lib.mjs';

// ── 第0章：テーブルの定義が変わった ──────────────────────────────
diagram(
  'core',
  {
    w: 960,
    h: 420,
    minWidth: 700,
    title: 'Hive ではディレクトリの中身全部がテーブルになり、OTF ではスナップショットに列挙されたファイルだけがテーブルになる',
    caption:
      '左：Hive ではディレクトリを LIST した結果がそのままテーブルになるため、書き込み途中のファイルも読まれてしまう。右：OTF ではスナップショットに列挙されたファイルだけがテーブルになる。新しいファイル（part-5）はコミットで参照されるまで見えず、旧版の v41 を読めばタイムトラベルになる。',
  },
  g => {
    // 左：Hive
    g.t(240, 26, '従来：Hive テーブル', 'tx-h');
    g.t(240, 52, 'テーブル ＝ ディレクトリにいま在るファイル全部', 'tx-s', 'middle', 420);
    g.node(170, 74, 140, 38, 'クエリ');
    g.arrow([[240, 112], [240, 158]]);
    g.label(252, 135, 'ディレクトリを LIST して全部読む', 'tx-s', 'start', 240);
    g.box(40, 160, 400, 200, 'mu');
    g.t(56, 182, 's3://…/orders/dt=2024-06-01/', 'tx-s tx-mono', 'start', 370);
    ['part-0', 'part-1', 'part-2'].forEach((p, i) => g.node(58 + i * 96, 206, 86, 58, [[p, 'tx-s tx-mono']]));
    g.node(346, 206, 86, 58, [['part-3', 'tx-s tx-mono'], ['書込中', 'tx-xs tx-wm']], { cls: 'wm' });
    g.t(240, 300, '書き込み途中や失敗したファイルも', 'tx-s', 'middle', 380);
    g.t(240, 324, '「テーブルの一部」として読まれてしまう', 'tx-s tx-wm', 'middle', 380);

    // 右：OTF
    g.t(720, 26, 'OTF：Iceberg・Delta Lake・Hudi', 'tx-h');
    g.t(720, 52, 'テーブル ＝ スナップショットに列挙されたファイル', 'tx-s', 'middle', 420);
    g.node(650, 74, 140, 38, 'クエリ');
    g.arrow([[720, 112], [720, 138]]);
    g.node(600, 140, 240, 36, [['現在のバージョン ＝ v42', 'tx-s tx-b']], { cls: 'ac' });
    g.arrow([[825, 176], [825, 198]], { cls: 'ac' });
    g.node(520, 200, 190, 54, [['v41（過去版）', 'tx-s tx-b'], ['part-0, part-1, part-2', 'tx-xs tx-mono']], { cls: 'mu' });
    g.node(730, 200, 190, 54, [['v42（現在）', 'tx-s tx-b'], ['part-0, part-2, part-4', 'tx-xs tx-mono']], { cls: 'ac' });
    g.box(520, 282, 400, 120, 'mu');
    g.t(536, 300, 'オブジェクトストレージ（S3 など）', 'tx-xs', 'start', 300);
    const files = [
      ['part-0', null, ''],
      ['part-1', '旧版のみ', 'mu'],
      ['part-2', null, ''],
      ['part-4', 'v42で追加', 'ac'],
      ['part-5', '未コミット', 'gh'],
    ];
    files.forEach(([name, note, cls], i) => {
      const rows = note ? [[name, 'tx-xs tx-mono'], [note, 'tx-xs']] : [[name, 'tx-xs tx-mono']];
      g.node(532 + i * 78, 326, 70, 60, rows, { cls, pad: 4 });
    });
    g.arrow([[780, 254], [567, 324]], { cls: 'ac' });
    g.arrow([[825, 254], [723, 324]], { cls: 'ac' });
    g.arrow([[870, 254], [801, 324]], { cls: 'ac' });
  },
);

// ── 第1章：レイヤー構造 ─────────────────────────────────────
diagram(
  'layers',
  {
    w: 1000,
    h: 372,
    minWidth: 760,
    title: '計算エンジン・カタログ・テーブルフォーマット・ファイルフォーマット・ストレージの5層と、Databricks・Kudu・従来のDWHが担う範囲',
    caption:
      'OTF は、データベースを層に分けたときの「テーブルフォーマット」層にあたる。Parquet はその下のファイルフォーマット層。Kudu は下の3層をサーバとしてまとめて実装し、従来のクラウド DWH は全層を一社で閉じて実装する。Databricks は上の3層それぞれに自社の実装（Spark・Photon、Unity Catalog、Delta Lake）を持つ。',
  },
  g => {
    const rows = [
      ['計算エンジン', 'Spark・Trino・Flink・DuckDB・Snowflake ほか', ''],
      ['カタログ', 'HMS・Glue・Unity Catalog・Polaris・REST', ''],
      ['テーブルフォーマット', 'Iceberg・Delta Lake・Hudi・Paimon', 'ac'],
      ['ファイルフォーマット', 'Parquet・ORC・Avro', ''],
      ['ストレージ', 'S3・ADLS・GCS・HDFS', ''],
    ];
    rows.forEach(([name, ex, cls], i) => {
      const y = 20 + i * 68;
      g.box(190, y, 530, 58, cls);
      g.t(206, y + 29, name, 'tx-b', 'start', 175);
      g.t(392, y + 29, ex, 'tx-s', 'start', cls ? 270 : 318);
      if (cls) g.t(708, y + 29, '← OTF', 'tx-s tx-b tx-ac', 'end');
    });
    // Databricks（左）
    g.bracket(180, 24, 210, 'left');
    g.lines(88, 117, [['Databricks', 'tx-b'], ['Spark・Photon', 'tx-xs'], ['Unity Catalog', 'tx-xs'], ['Delta Lake', 'tx-xs']], { max: 156 });
    // Kudu（右）
    g.bracket(730, 160, 346, 'right');
    g.lines(805, 253, [['Apache Kudu', 'tx-b'], ['この3層を', 'tx-xs'], ['常駐サーバとして', 'tx-xs'], ['一体で実装', 'tx-xs']], { max: 120 });
    // 従来のDWH（右端）
    g.bracket(875, 24, 346, 'right');
    g.lines(938, 185, [['Snowflake', 'tx-b'], ['など従来の', 'tx-xs'], ['クラウド DWH', 'tx-xs'], ['全層を独自・', 'tx-xs'], ['非公開で実装', 'tx-xs']], { max: 112 });
  },
);

// ── 第2章：年表（流れごと） ───────────────────────────────────
diagram(
  'timeline',
  {
    w: 1000,
    h: 404,
    minWidth: 780,
    title: '2003年から2026年までのデータ基盤の主要な出来事を、Hadoop、列指向ファイル、クラウドDWH、ストレージ、OTF、標準化の流れごとに並べた年表',
    caption:
      '主要な出来事を流れごとに並べた年表。2010年代前半に列指向ファイルとクラウド DWH が出そろい、2016〜2017年に3つの OTF がほぼ同時に生まれた。2022年以降は相互運用とカタログの標準化に焦点が移っている。細かな出来事は本文の年表を参照。',
  },
  g => {
    const X = y => 205 + (y - 2003) * 33.4;
    const lanes = [
      ['Hadoop・Hive', [2006, 2016.5], [[2006, 'Hadoop', 'up'], [2008, 'Hive OSS', 'down'], [2014, 'Hive ACID', 'up']]],
      ['列指向ファイル', [2010, 2026.5], [[2010, 'Dremel 論文', 'up'], [2013, 'Parquet・ORC', 'down'], [2016, 'Arrow', 'up']]],
      ['クラウド DWH', [2012, 2026.5], [[2012, 'Redshift', 'up'], [2014.8, 'Snowflake', 'down']]],
      ['ストレージ', [2015, 2026.5], [[2015.7, 'Kudu', 'up'], [2020.9, 'S3 強い整合性', 'down'], [2024.6, 'S3 条件付き書込', 'up']]],
      ['OTF', [2016, 2026.5], [[2016, 'Hudi', 'up'], [2017, 'Iceberg', 'down'], [2019.3, 'Delta Lake OSS', 'up'], [2021.6, 'Iceberg v2', 'down'], [2025.7, 'Iceberg v3 GA', 'up', 'end']], 'ac'],
      ['標準化・収束', [2020, 2026.5], [[2021, 'Lakehouse 論文', 'up'], [2023.5, 'UniForm', 'down'], [2024.4, 'Tabular 買収・Polaris', 'up'], [2026.15, 'Polaris TLP', 'down', 'end']]],
    ];
    lanes.forEach(([name, [s, e], events, cls], i) => {
      const cy = 46 + i * 52;
      g.box(14, cy - 24, 972, 48, 'band', 4);
      g.t(26, cy, name, 'tx-s tx-b', 'start', 160);
      g.box(X(s), cy - 4, X(e) - X(s), 8, cls === 'ac' ? 'ac' : 'mu', 4);
      events.forEach(([yr, label, pos, anchor]) => {
        g.circle(X(yr), cy, 5.5, cls === 'ac' ? 'dot ac' : 'dot');
        const a = anchor ?? 'middle';
        const lx = a === 'end' ? X(yr) + 8 : X(yr);
        g.t(lx, pos === 'up' ? cy - 14 : cy + 14, label, 'tx-xs' + (cls === 'ac' ? ' tx-ac tx-b' : ''), a);
      });
    });
    const axisY = 372;
    g.line(X(2003), axisY, X(2026.5), axisY, 'thin');
    for (let y = 2003; y <= 2026; y++) g.line(X(y), axisY - (y % 5 === 0 ? 6 : 3), X(y), axisY, 'thin');
    [2005, 2010, 2015, 2020, 2025].forEach(y => g.t(X(y), axisY + 16, String(y), 'tx-s'));
  },
);

// ── 2.2 Parquet の構造と読み方 ─────────────────────────────────
diagram(
  'parquet',
  {
    w: 960,
    h: 470,
    minWidth: 700,
    title: 'Parquet ファイルの構造と、footer の統計で Row Group を飛ばし、必要な列だけを読む流れ',
    caption:
      'Parquet ファイルの構造と、クエリ「SELECT sum(amount) WHERE ts >= \'06-02\'」の読み方。読み手はまず末尾の footer を読み、統計から Row Group 1 は条件に合わないと判断して丸ごと飛ばす。Row Group 0 でも、使う列（ts と amount）の列チャンクだけを読む。列チャンク右の小さな四角はページ（エンコードと圧縮の単位）。',
  },
  g => {
    g.node(40, 20, 380, 30, [['"PAR1"（マジックナンバー）', 'tx-s tx-mono']], { cls: 'mu' });
    g.box(40, 60, 380, 170);
    g.t(56, 80, 'Row Group 0　ts: 06-01〜06-02', 'tx-s tx-b', 'start', 350);
    [['order_id', ''], ['ts', 'ac'], ['amount', 'ac']].forEach(([col, cls], i) => {
      const y = 96 + i * 42;
      g.box(56, y, 348, 36, cls);
      g.t(68, y + 18, 'Column chunk: ' + col, 'tx-s', 'start', 220);
      for (let p = 0; p < 4; p++) g.box(300 + p * 24, y + 8, 18, 20, 'mu', 3);
    });
    g.box(40, 240, 380, 78, 'mu');
    g.t(56, 260, 'Row Group 1　ts: 05-20〜05-31', 'tx-s tx-b', 'start', 260);
    g.t(56, 292, 'order_id・ts・amount の列チャンク', 'tx-xs', 'start', 250);
    g.node(326, 266, 80, 30, [['読まない', 'tx-xs tx-b']], { cls: 'bad' });
    g.node(40, 328, 380, 96, [['Footer（FileMetaData）', 'tx-b'], ['スキーマ ／ Row Group の位置', 'tx-s'], ['列チャンクごとの min・max・null 数', 'tx-s']], { cls: 'wm' });
    g.node(40, 432, 380, 28, [['footer の長さ ＋ "PAR1"', 'tx-xs tx-mono']], { cls: 'mu' });

    g.node(560, 20, 380, 56, [['クエリ', 'tx-s tx-b'], ["SELECT sum(amount) WHERE ts >= '06-02'", 'tx-xs tx-mono']]);
    g.arrow([[552, 376], [428, 376]], { cls: 'wm' });
    g.lines(562, 376, [['① 末尾の footer を先に読む', 'tx-s tx-b'], ['列の位置と統計が分かる', 'tx-xs']], { anchor: 'start', max: 380 });
    g.arrow([[552, 279], [428, 279]], { cls: 'bad' });
    g.lines(562, 279, [['② ts の最大値（05-31）＜ 06-02', 'tx-s tx-b'], ['→ Row Group 1 は丸ごと読まない', 'tx-xs']], { anchor: 'start', max: 380 });
    g.arrow([[552, 170], [412, 156]], { cls: 'ac' });
    g.arrow([[552, 184], [412, 198]], { cls: 'ac' });
    g.lines(562, 177, [['③ 使う列（ts・amount）だけ読む', 'tx-s tx-b'], ['order_id 列は一切読まない', 'tx-xs']], { anchor: 'start', max: 380 });
  },
);

// ── 2.3 Hive のコミットと S3 ────────────────────────────────
diagram(
  'hive-s3',
  {
    w: 1000,
    h: 356,
    minWidth: 760,
    title: 'HDFS では rename が一瞬で原子的だが、S3 では rename がコピーと削除の繰り返しになり、途中状態が見える',
    caption:
      'Hadoop のコミット方式は「一時ディレクトリに書いてから rename」。HDFS では rename が NameNode 上のメタデータ操作なので一瞬で原子的だった。S3 には rename がなく、オブジェクトを1つずつコピーして削除するため、途中で失敗すると半端な状態が残る。さらに S3 の LIST は2020年12月まで結果整合性だった。',
  },
  g => {
    g.t(250, 28, 'HDFS：rename が一瞬・原子的', 'tx-h');
    g.node(40, 70, 180, 56, [['_temporary/', 'tx-s tx-mono'], ['part-0 … part-9', 'tx-xs tx-mono']], { cls: 'mu' });
    g.arrow([[222, 98], [288, 98]], { cls: 'ok' });
    g.label(255, 84, 'rename', 'tx-s tx-b');
    g.node(290, 70, 170, 56, [['dt=06-01/', 'tx-s tx-mono'], ['part-0 … part-9', 'tx-xs tx-mono']], { cls: 'ok' });
    g.lines(250, 178, [['NameNode のメタデータを書き換えるだけ', 'tx-s'], ['→ 全ファイルが一度に見える', 'tx-s tx-b tx-ok']], { max: 420 });

    g.t(750, 28, 'S3：rename ＝ 1ファイルずつコピー＋削除', 'tx-h');
    g.node(530, 70, 170, 56, [['_temporary/', 'tx-s tx-mono'], ['part-0 … part-9', 'tx-xs tx-mono']], { cls: 'mu' });
    g.arrow([[702, 98], [798, 98]], { cls: 'wm' });
    g.label(750, 84, 'COPY ×10', 'tx-xs tx-b');
    g.label(750, 112, 'DELETE ×10', 'tx-xs tx-b');
    g.node(800, 70, 170, 56, [['dt=06-01/', 'tx-s tx-mono'], ['part-0, part-1 …', 'tx-xs tx-mono']], { cls: 'wm' });
    g.node(560, 150, 380, 44, [['途中で落ちると「一部だけコピー済み」が見える', 'tx-s tx-b']], { cls: 'bad' });
    g.node(560, 204, 380, 54, [['LIST は 2020年12月まで結果整合', 'tx-s tx-b'], ['書いた直後のファイルが一覧に出ないことがあった', 'tx-xs']], { cls: 'wm' });

    g.node(40, 286, 920, 50, [['共通の問題：計画のたびに全パーティションを LIST（S3 は1回最大1000キー）→ 数万パーティションでは計画だけで数分', 'tx-s']], { cls: 'mu' });
  },
);

// ── 2.4 3つのアプローチ ─────────────────────────────────────
diagram(
  'approaches',
  {
    w: 1000,
    h: 372,
    minWidth: 780,
    title: '専用ストレージエンジン、クローズドなクラウドDWH、オープンなファイルとメタデータ層という3つのアプローチの構造の違い',
    caption:
      '同じ課題への3つの解き方。(A) Kudu は読み書きの経路に常駐サーバが入り、計算と保存が同じクラスタにある。(B) Snowflake の内部は OTF とよく似た構造だが、全体がベンダーの中に閉じている。(C) OTF はサーバを持たず、公開仕様のファイルとメタデータを、どのエンジンも直接読み書きする。',
  },
  g => {
    // (A)
    g.t(170, 26, '(A) 専用ストレージエンジン', 'tx-h', 'middle', 290);
    g.t(170, 50, '例：Apache Kudu、HBase', 'tx-s');
    g.node(60, 76, 220, 40, [['Impala・Spark', 'tx-s']]);
    g.arrow([[170, 116], [170, 156]], { cls: 'wm' });
    g.label(180, 136, 'Kudu API 経由のみ', 'tx-xs', 'start');
    g.box(40, 158, 260, 128, 'wm');
    g.t(170, 176, 'Kudu クラスタ（常駐サーバ）', 'tx-s tx-b', 'middle', 240);
    [54, 133, 212].forEach(x => g.node(x, 192, 74, 80, [['Tablet', 'tx-xs'], ['Server', 'tx-xs'], ['＋ディスク', 'tx-xs']], { pad: 4 }));
    g.lines(170, 322, [['計算と保存が同じクラスタ', 'tx-s'], ['データは Kudu の内部形式', 'tx-s tx-wm']], { max: 290 });

    // (B)
    g.t(500, 26, '(B) クローズドなクラウド DWH', 'tx-h', 'middle', 300);
    g.t(500, 50, '例：Snowflake、BigQuery', 'tx-s');
    g.box(360, 66, 280, 226, 'gh');
    g.t(500, 82, 'ベンダーの内部（非公開）', 'tx-xs');
    g.node(390, 96, 220, 40, [['Snowflake のエンジン', 'tx-s']]);
    g.arrow([[500, 136], [500, 160]]);
    g.node(390, 162, 220, 44, [['メタデータ（FoundationDB）', 'tx-s']], { cls: 'wm' });
    g.arrow([[500, 206], [500, 228]]);
    g.node(390, 230, 220, 52, [['S3 上の独自形式ファイル', 'tx-s'], ['（micro-partition）', 'tx-xs']]);
    g.lines(500, 322, [['内部の構造は OTF とほぼ同じ', 'tx-s'], ['ただし外からは読めない', 'tx-s tx-wm']], { max: 300 });

    // (C)
    g.t(830, 26, '(C) ファイル＋メタデータ層', 'tx-h', 'middle', 300);
    g.t(830, 50, '例：Iceberg、Delta Lake、Hudi', 'tx-s');
    ['Spark', 'Trino', 'Flink', 'DuckDB'].forEach((e, i) => {
      g.node(690 + i * 70, 80, 62, 36, [[e, 'tx-xs']], { pad: 3 });
      g.arrow([[721 + i * 70, 116], [721 + i * 70, 194]], { cls: 'ac' });
    });
    g.box(686, 196, 280, 96, 'ac');
    g.t(826, 212, 'オブジェクトストレージ（公開仕様）', 'tx-xs tx-b', 'middle', 270);
    g.node(700, 226, 122, 56, [['Parquet', 'tx-s'], ['データファイル', 'tx-xs']]);
    g.node(830, 226, 122, 56, [['メタデータ', 'tx-s'], ['ログ・統計', 'tx-xs']]);
    g.lines(826, 322, [['どのエンジンも直接読める', 'tx-s'], ['サーバ不要・仕様は公開', 'tx-s tx-ac']], { max: 300 });
  },
);

// ── 2.4 Kudu の内部 ────────────────────────────────────────
diagram(
  'kudu',
  {
    w: 1000,
    h: 400,
    minWidth: 780,
    title: 'Kudu のクラスタ構成と、1つの tablet の中での INSERT と UPDATE の書き込み経路',
    caption:
      '左：Kudu は Master と Tablet Server からなる常駐クラスタで、各 tablet を Raft で3重に複製する（破線が同じ tablet の複製）。右：1つの tablet の中では、INSERT はまずメモリ上の MemRowSet に入り、列指向の DiskRowSet へ書き出される。既存行の更新は差分（delta）として別に書かれ、後で compaction によって base に統合される。',
  },
  g => {
    g.node(20, 20, 370, 40, [['Master：テーブルと tablet の配置を管理', 'tx-s']]);
    g.t(205, 74, '同じ tablet を Raft で3重に複製（破線）', 'tx-xs', 'middle', 360);
    const servers = [
      [['T1', 'Leader', 'ac'], ['T2', 'Follower', '']],
      [['T1', 'Follower', ''], ['T2', 'Leader', 'ac']],
      [['T1', 'Follower', ''], ['T2', 'Follower', '']],
    ];
    servers.forEach((reps, i) => {
      const x = 20 + i * 130;
      g.box(x, 88, 110, 146);
      g.t(x + 55, 104, 'Tablet Server', 'tx-xs tx-b');
      reps.forEach(([t, role, cls], j) => g.node(x + 10, 118 + j * 54, 90, 44, [[t, 'tx-xs tx-b'], [role, 'tx-xs']], { cls, pad: 4 }));
    });
    [[120, 140, 160], [250, 140, 290]].forEach(([x1, y, x2]) => g.line(x1, y, x2, y, 'ac dash'));
    [[120, 194, 160], [250, 194, 290]].forEach(([x1, y, x2]) => g.line(x1, y, x2, y, 'dash'));
    g.node(90, 290, 230, 40, [['Impala・Spark（Kudu API）', 'tx-s']]);
    g.arrow([[205, 290], [205, 238]], { cls: 'wm', tail: true });
    g.label(215, 262, 'ミリ秒単位で読み書き', 'tx-xs', 'start');

    g.t(710, 26, '1つの tablet の中（書き込みの流れ）', 'tx-h', 'middle', 520);
    g.node(440, 70, 120, 40, [['INSERT', 'tx-s tx-b']]);
    g.node(432, 190, 130, 52, [['UPDATE・DELETE', 'tx-xs tx-b'], ['（既存の行）', 'tx-xs']], { pad: 5 });
    g.node(600, 62, 170, 56, [['MemRowSet', 'tx-s tx-b'], ['メモリ上・行形式', 'tx-xs']], { cls: 'ac' });
    g.node(600, 188, 170, 56, [['DeltaMemStore', 'tx-s tx-b'], ['更新差分をメモリに', 'tx-xs']], { cls: 'ac' });
    g.arrow([[560, 90], [598, 90]]);
    g.arrow([[562, 216], [598, 216]]);
    g.box(810, 46, 170, 284);
    g.t(895, 62, 'DiskRowSet', 'tx-s tx-b');
    g.node(822, 78, 146, 64, [['Base data', 'tx-s tx-b'], ['列指向（CFile）', 'tx-xs']]);
    g.node(822, 188, 146, 64, [['Delta files', 'tx-s tx-b'], ['REDO ／ UNDO', 'tx-xs']], { cls: 'wm' });
    g.node(822, 266, 146, 52, [['主キー索引', 'tx-xs tx-b'], ['＋ブルームフィルタ', 'tx-xs']], { cls: 'mu' });
    g.arrow([[770, 90], [820, 104]]);
    g.label(795, 80, 'flush', 'tx-xs');
    g.arrow([[770, 216], [820, 220]]);
    g.label(795, 204, 'flush', 'tx-xs');
    g.arrow([[895, 188], [895, 144]], { cls: 'wm' });
    g.t(888, 166, 'compaction', 'tx-xs tx-wm', 'end');
    g.arrow([[497, 242], [497, 292], [820, 292]], { cls: 'dash' });
    g.label(660, 292, '更新する行の位置を引く', 'tx-xs');
    g.t(710, 368, 'base ＋ 差分を書き、後でまとめる → OTF の Merge-on-Read と同じ発想', 'tx-s tx-b', 'middle', 540);
  },
);

// ── 2.5 Lakehouse ─────────────────────────────────────────
diagram(
  'lakehouse',
  {
    w: 1000,
    h: 340,
    minWidth: 760,
    title: 'データレイクとDWHの2層構成と、OTFで1つのコピーを共有する Lakehouse 構成の比較',
    caption:
      '左：従来の2層構成では、データレイクから DWH へ ETL でデータを複製するため、コピーが2つになり、鮮度の遅れや整合性の問題が生じる。右：Lakehouse では、OTF のメタデータが ACID・スキーマ・統計を担い、BI も ML もストリーミングも同じ1つのコピーを直接読む。',
  },
  g => {
    g.t(245, 26, '2層構成（データレイク ＋ DWH）', 'tx-h', 'middle', 460);
    g.node(24, 70, 96, 46, [['業務DB', 'tx-xs'], ['ログ', 'tx-xs']]);
    g.arrow([[120, 93], [148, 93]]);
    g.node(150, 64, 130, 58, [['データレイク', 'tx-s tx-b'], ['S3 の生ファイル', 'tx-xs']]);
    g.arrow([[280, 93], [328, 93]], { cls: 'wm' });
    g.label(304, 78, 'ETL', 'tx-xs tx-b');
    g.node(330, 64, 140, 58, [['DWH', 'tx-s tx-b'], ['独自形式の複製', 'tx-xs']], { cls: 'wm' });
    g.arrow([[215, 122], [215, 186]]);
    g.arrow([[400, 122], [400, 186]]);
    g.node(150, 188, 130, 40, [['ML・データ科学', 'tx-s']]);
    g.node(330, 188, 140, 40, [['BI・レポート', 'tx-s']]);
    g.lines(245, 280, [['データが2コピー・ETL の遅延', 'tx-s tx-b tx-wm'], ['整合しない・ロックイン・二重のコスト', 'tx-s tx-wm']], { max: 460 });

    g.line(500, 40, 500, 320, 'thin dash');

    g.t(760, 26, 'Lakehouse（OTF で1層に）', 'tx-h', 'middle', 460);
    g.node(530, 70, 96, 46, [['業務DB', 'tx-xs'], ['ログ', 'tx-xs']]);
    g.arrow([[626, 93], [648, 93]]);
    g.node(650, 58, 200, 70, [['オブジェクトストレージ', 'tx-s tx-b'], ['Parquet ＋ OTF メタデータ', 'tx-xs'], ['コピーは1つだけ', 'tx-xs tx-ac']], { cls: 'ac' });
    g.arrow([[700, 128], [620, 186]], { cls: 'ac' });
    g.arrow([[750, 128], [760, 186]], { cls: 'ac' });
    g.arrow([[800, 128], [900, 186]], { cls: 'ac' });
    g.node(560, 188, 120, 40, [['BI・SQL', 'tx-s']]);
    g.node(700, 188, 120, 40, [['ML', 'tx-s']]);
    g.node(840, 188, 120, 40, [['ストリーミング', 'tx-s']]);
    g.lines(760, 280, [['ACID・スキーマ・統計はメタデータ層が担う', 'tx-s tx-b tx-ac'], ['BI も ML も同じデータを直接読む', 'tx-s tx-ac']], { max: 460 });
  },
);
