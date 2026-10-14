import { diagram } from './lib.mjs';

// ── 4.2 分解されたデータベース ────────────────────────────────
diagram(
  'unbundled',
  {
    w: 1000,
    h: 476,
    minWidth: 800,
    title: 'RDBMS が1つのプロセスの中に持つ構成要素と、OTF の世界で層ごとに分かれた対応物',
    caption:
      '左：RDBMS は、SQL の処理からトランザクション管理、データページまでを1つのプロセスの中に持ち、形式も非公開。右：OTF の世界では同じ役割が層ごとに分かれ、それぞれ別の製品や公開仕様が担う。WAL と MVCC にあたるのがテーブルフォーマットのメタデータで、ロックの代わりに楽観的同時実行制御を使う。バッファプールにあたる層は共通には存在せず、各エンジンのキャッシュに任される。',
  },
  g => {
    g.t(220, 22, 'RDBMS：1つのプロセスの中に全部', 'tx-h', 'middle', 400);
    g.box(20, 44, 400, 414);
    g.t(780, 22, 'OTF：層ごとに分解・標準化', 'tx-h', 'middle', 400);
    const rows = [
      ['SQL・オプティマイザ・実行器', ['計算エンジン（差し替え可能）', 'Spark・Trino・Flink・DuckDB…'], ''],
      ['システムカタログ', ['カタログ', 'HMS・Glue・Unity・Polaris・REST'], ''],
      ['トランザクション管理', ['テーブルフォーマットのメタデータ', 'ログ・スナップショット・楽観的制御'], 'ac'],
      ['バッファプール', ['共通の層はない', '各エンジンのキャッシュに任される'], 'mu'],
      ['データページ（独自形式）', ['Parquet ファイル（公開仕様）', 'イミュータブル・列指向'], ''],
      ['ローカルディスク', ['オブジェクトストレージ', 'S3・ADLS・GCS'], ''],
    ];
    rows.forEach(([left, [r1, r2], cls], i) => {
      const y = 60 + i * 66;
      const sub = i === 2 ? 'WAL・ロック・MVCC' : null;
      g.node(40, y, 360, 52, sub ? [[left, 'tx-s tx-b'], [sub, 'tx-xs']] : [[left, 'tx-s tx-b']]);
      g.node(580, y, 400, 52, [[r1, 'tx-s tx-b'], [r2, 'tx-xs']], { cls });
      g.line(400, y + 26, 580, y + 26, 'thin dash');
      g.label(490, y + 26, '≒', 'tx-s tx-b');
    });
  },
);

// ── 4.3 1行を更新するときの経路（Kudu と OTF） ───────────────────
diagram(
  'kudu-vs-otf',
  {
    w: 1000,
    h: 262,
    minWidth: 780,
    title: '1行を更新するとき、Kudu はサーバのメモリに書いて複製すればミリ秒で終わり、OTF はファイルとメタデータを書いてカタログで切り替えるため数百ミリ秒から秒かかる',
    caption:
      '1行を更新するときの経路（概念図。長さは規模感を示すもので実測値ではない）。Kudu は常駐サーバのメモリに書いて Raft で複製すれば終わる。OTF はオブジェクトストレージへのファイル書き込み、メタデータの書き込み、カタログでの切り替えと、ストレージとの往復を何度も重ねる。そのかわり、常駐サーバを持たず、どのエンジンからも読める。',
  },
  g => {
    const lane = (y, name, sub, steps, cls, result, note) => {
      g.lines(24, y, [[name, 'tx-b'], [sub, 'tx-xs']], { anchor: 'start', max: 150 });
      let x = 180;
      steps.forEach(([label, w]) => {
        g.node(x, y - 22, w - 6, 44, [[label, 'tx-xs']], { cls, pad: 4 });
        x += w;
      });
      g.t(x + 8, y, result, `tx-s tx-b tx-${cls === 'ac' ? 'ac' : 'wm'}`, 'start', 980 - x - 8);
      g.t(180, y + 40, note, 'tx-xs', 'start', 780);
    };
    lane(70, 'Kudu', '常駐サーバ', [['受信', 56], ['メモリに書く', 96], ['Raft 複製', 84], ['ack', 50]], 'ac', '≈ ミリ秒', '主キーで行を特定し、その場で上書きする。点検索も速い');
    lane(190, 'OTF', 'ファイル＋メタデータ', [['対象ファイル特定', 120], ['Parquet・DV を S3 へ', 160], ['メタデータを書く', 120], ['カタログで CAS', 120]], 'wm', '≈ 数百ミリ秒〜秒', 'ファイル単位で不変ファイルを足していく。1テーブルへの高頻度コミットは苦手（競合ならリトライ）');
    g.t(980, 248, '※長さは規模感を示す概念図で、実測値ではない', 'tx-xs', 'end');
  },
);

// ── 6 メンテナンスのライフサイクル ─────────────────────────────
diagram(
  'maintenance',
  {
    w: 1000,
    h: 330,
    minWidth: 780,
    title: 'ストリーミングの小さなコミットが小ファイルとスナップショットを増やし、compaction・スナップショットの失効・物理削除で片付ける流れ',
    caption:
      '数秒ごとのコミットで小さなファイル（f1〜f6）とスナップショット（s1〜s6）が増えていく。compaction（s7）でそれらを大きなファイル F にまとめても、古いファイルは s1〜s6 から参照されているので消えない。保持期間を過ぎたスナップショットを失効させ、どこからも参照されなくなったファイルを削除して、ようやく容量が減る。',
  },
  g => {
    g.arrow([[40, 74], [960, 74]]);
    g.t(960, 96, '時間', 'tx-xs', 'end');
    g.box(52, 44, 360, 60, 'gh');
    g.t(232, 118, '保持期間を過ぎたら expire_snapshots で失効', 'tx-xs tx-wm tx-b', 'middle', 380);
    for (let i = 0; i < 6; i++) {
      const x = 80 + i * 60;
      g.circle(x, 74, 6, 'dot');
      g.t(x, 56, 's' + (i + 1), 'tx-xs tx-mono');
    }
    g.circle(600, 74, 7, 'dot ac');
    g.t(600, 54, 's7 compaction', 'tx-xs tx-b tx-ac');
    g.circle(800, 74, 7, 'dot ac');
    g.t(800, 54, 's8 追記', 'tx-xs tx-b tx-ac');
    g.line(560, 28, 860, 28, 'ac');
    g.line(560, 22, 560, 34, 'ac');
    g.line(860, 22, 860, 34, 'ac');
    g.label(710, 28, '保持期間内（タイムトラベル可）', 'tx-xs tx-ac tx-b', 'middle', 290);

    g.t(40, 148, '小さなファイル（ストリーミングで数秒ごとに1つ）', 'tx-xs', 'start', 400);
    for (let i = 0; i < 6; i++) g.node(58 + i * 60, 164, 44, 40, [['f' + (i + 1), 'tx-xs tx-mono']], { cls: 'mu', pad: 4 });
    g.arrow([[420, 184], [508, 184]], { cls: 'ac' });
    g.label(464, 170, 'rewrite', 'tx-xs tx-mono');
    g.node(510, 162, 180, 44, [['F（大きなファイル）', 'tx-xs tx-b']], { cls: 'ac' });
    g.node(780, 162, 44, 44, [['f7', 'tx-xs tx-mono']], { cls: 'ac', pad: 4 });
    g.line(600, 81, 600, 160, 'thin dash');
    g.line(800, 81, 802, 160, 'thin dash');
    g.line(796, 81, 640, 160, 'thin dash');

    g.arrow([[232, 248], [232, 208]], { cls: 'wm' });
    g.node(40, 250, 400, 60, [['s1〜s6 が失効すると f1〜f6 は誰からも参照されない', 'tx-xs tx-b'], ['→ VACUUM ／ remove_orphan_files で物理削除', 'tx-xs']], { cls: 'wm' });
    g.node(500, 250, 460, 60, [['ここで初めて容量が減り、GDPR の削除も完了する', 'tx-xs tx-b'], ['（それまではタイムトラベル用に古いファイルが残る）', 'tx-xs']], { cls: 'mu' });
  },
);

// ── 7 選び方 ──────────────────────────────────────────────
diagram(
  'decision',
  {
    w: 1000,
    h: 500,
    minWidth: 780,
    title: '要件の質問に上から答えていき、OLTP DB、Delta Lake、Hudi、Paimon、DuckLake、Iceberg のどれを第一候補にするかを決める流れ',
    caption:
      '上から順に答えていく選び方の目安。最初の質問で「はい」なら、そもそも OTF の守備範囲外。どの条件にも当てはまらなければ、複数のエンジンやクラウドで共有できる Iceberg が既定の選択になる。実際には、既存の基盤、チームのスキル、使うエンジンの対応状況もあわせて判断する。',
  },
  g => {
    const qs = [
      ['ミリ秒単位の更新や点検索が必要？', [['OLTP DB・KVS', 'tx-s tx-b'], ['既存資産があれば Kudu も', 'tx-xs']], 'wm'],
      ['主に Databricks ／ Microsoft Fabric を使う？', [['Delta Lake', 'tx-s tx-b'], ['外部へは UniForm で Iceberg として公開', 'tx-xs']], 'ac'],
      ['upsert・CDC が中心で、レコード索引が欲しい？', [['Apache Hudi', 'tx-s tx-b'], ['Merge-on-Read・レコード索引', 'tx-xs']], 'ac'],
      ['Flink で常時 upsert をストリーミングする？', [['Apache Paimon', 'tx-s tx-b'], ['または Iceberg ＋ Flink', 'tx-xs']], 'ac'],
      ['小〜中規模で、DuckDB 中心にシンプルにしたい？', [['DuckLake', 'tx-s tx-b'], ['メタデータを SQL DB に置く新しい方式', 'tx-xs']], 'ac'],
    ];
    qs.forEach(([q, ans, cls], i) => {
      const y = 20 + i * 80;
      g.node(40, y, 520, 50, [[q, 'tx-s tx-b']]);
      g.arrow([[560, y + 25], [638, y + 25]], { cls: cls === 'wm' ? 'wm' : 'ac' });
      g.label(599, y + 13, 'はい', 'tx-xs tx-b');
      g.node(640, y, 320, 50, ans, { cls });
      g.arrow([[300, y + 50], [300, y + 78]]);
      g.label(312, y + 64, 'いいえ', 'tx-xs', 'start');
    });
    g.node(40, 420, 520, 56, [['どれにも当てはまらない → Apache Iceberg', 'tx-s tx-b'], ['複数エンジン・複数クラウドで共有する事実上の標準', 'tx-xs']], { cls: 'ac' });
  },
);
