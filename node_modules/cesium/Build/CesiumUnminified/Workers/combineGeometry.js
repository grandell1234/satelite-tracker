/**
 * @license
 * Cesium - https://github.com/CesiumGS/cesium
 * Version 1.123
 *
 * Copyright 2011-2022 Cesium Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Columbus View (Pat. Pend.)
 *
 * Portions licensed separately.
 * See https://github.com/CesiumGS/cesium/blob/main/LICENSE.md for full licensing details.
 */

import {
  PrimitivePipeline_default
} from "./chunk-HYUTWUXN.js";
import {
  createTaskProcessorWorker_default
} from "./chunk-HILBDZUP.js";
import "./chunk-US3L7FXC.js";
import "./chunk-C4IAULHW.js";
import "./chunk-VUCVRDLD.js";
import "./chunk-GMGUR5GM.js";
import "./chunk-5YKJKOFE.js";
import "./chunk-AL7BHP36.js";
import "./chunk-JRULXFCC.js";
import "./chunk-2RHMHHJH.js";
import "./chunk-62YGXNGC.js";
import "./chunk-WQCX7U65.js";
import "./chunk-7OISMGQF.js";
import "./chunk-B4AZL6Q4.js";
import "./chunk-W2Q2F7JS.js";
import "./chunk-IL6SMMDD.js";
import "./chunk-2B5H7KIN.js";
import "./chunk-IT6AWHFV.js";
import "./chunk-WW5RTJ72.js";
import "./chunk-T6FZFMTF.js";
import "./chunk-3UJV3W4Y.js";

// packages/engine/Source/Workers/combineGeometry.js
function combineGeometry(packedParameters, transferableObjects) {
  const parameters = PrimitivePipeline_default.unpackCombineGeometryParameters(packedParameters);
  const results = PrimitivePipeline_default.combineGeometry(parameters);
  return PrimitivePipeline_default.packCombineGeometryResults(
    results,
    transferableObjects
  );
}
var combineGeometry_default = createTaskProcessorWorker_default(combineGeometry);
export {
  combineGeometry_default as default
};
