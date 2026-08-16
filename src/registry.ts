import type { PreviewDefinition } from "./types";
import { metricFocusDefinition } from "./previews/MetricFocus";
import { compareSplitDefinition } from "./previews/CompareSplit";
import { quoteLockupDefinition } from "./previews/QuoteLockup";
import { blurSlideDefinition } from "./previews/BlurSlide";
import { odometerRollDefinition } from "./previews/OdometerRoll";
import { scrubCompareDefinition } from "./previews/ScrubCompare";
import { letterspaceDefinition } from "./previews/Letterspace";
import { braceExpandDefinition } from "./previews/BraceExpand";
import { splitFlapDefinition } from "./previews/SplitFlap";
import { wordRollDefinition } from "./previews/WordRoll";
import { columnConvergeDefinition } from "./previews/ColumnConverge";
import { listRevealDefinition } from "./previews/ListReveal";
import { scanSweepDefinition } from "./previews/ScanSweep";
import { cardFlipDefinition } from "./previews/CardFlip";
import { gaugeReadoutDefinition } from "./previews/GaugeReadout";
import { chartLiveDefinition } from "./previews/ChartLive";
import { panelGridDefinition } from "./previews/PanelGrid";
import { lineGrowthDefinition } from "./previews/LineGrowth";
import { barRiseDefinition } from "./previews/BarRise";
import { donutShareDefinition } from "./previews/DonutShare";
import { areaFlowDefinition } from "./previews/AreaFlow";
import { bottomBandDefinition } from "./previews/BottomBand";
import { timelineStripDefinition } from "./previews/TimelineStrip";

export const REGISTRY: PreviewDefinition[] = [
  metricFocusDefinition,
  compareSplitDefinition,
  quoteLockupDefinition,
  blurSlideDefinition,
  odometerRollDefinition,
  scrubCompareDefinition,
  letterspaceDefinition,
  braceExpandDefinition,
  splitFlapDefinition,
  wordRollDefinition,
  columnConvergeDefinition,
  listRevealDefinition,
  scanSweepDefinition,
  cardFlipDefinition,
  gaugeReadoutDefinition,
  chartLiveDefinition,
  panelGridDefinition,
  lineGrowthDefinition,
  barRiseDefinition,
  donutShareDefinition,
  areaFlowDefinition,
  bottomBandDefinition,
  timelineStripDefinition,
];
