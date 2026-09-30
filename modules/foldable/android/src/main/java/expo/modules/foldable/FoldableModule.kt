package expo.modules.foldable

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class FoldableModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("Foldable")

    Events("onFoldStateChange", "onHingeAngleChange")

    AsyncFunction("isDeviceFoldable") {
      mapOf("foldable" to false, "supportsTabletop" to false)
    }

    AsyncFunction("getFoldState") {
      mapOf("state" to "flat", "isSeparating" to false, "posture" to "flat")
    }

    AsyncFunction("getHingeAngle") {
      mapOf("angle" to null, "status" to null)
    }
  }
}
