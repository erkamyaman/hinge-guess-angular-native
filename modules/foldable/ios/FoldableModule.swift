import ExpoModulesCore
import UIKit

public class FoldableModule: Module {
  private let foldable = Foldable()
  private weak var observedView: UIView?
  private var observers: [NSObjectProtocol] = []
  private var lastFoldState: NSDictionary?
  private var lastHingeAngle: NSDictionary?

  public func definition() -> ModuleDefinition {
    Name("Foldable")

    Events("onFoldStateChange", "onHingeAngleChange")

    AsyncFunction("isDeviceFoldable") { () -> [String: Bool] in
      self.observeRootView()
      return [
        "foldable": self.foldable.isDeviceFoldable(),
        "supportsTabletop": self.foldable.supportsTabletop(),
      ]
    }.runOnQueue(.main)

    AsyncFunction("getFoldState") { () -> [String: Any] in
      self.observeRootView()
      return self.foldable.getFoldState(in: self.observedView)
    }.runOnQueue(.main)

    AsyncFunction("getHingeAngle") { () -> [String: Any] in
      self.observeRootView()
      return self.foldable.getHingeAngle()
    }.runOnQueue(.main)

    OnStartObserving {
      DispatchQueue.main.async {
        self.observeRootView()
        self.startRefreshing()
      }
    }

    OnStopObserving {
      DispatchQueue.main.async { self.stopRefreshing() }
    }
  }

  private func observeRootView() {
    guard let root = Self.rootView(), root !== observedView else { return }
    observedView = root
    foldable.observeChanges(in: root) { [weak self] in self?.emitNowAndAfterSettling() }
  }

  private func startRefreshing() {
    guard observers.isEmpty else { return }
    UIDevice.current.beginGeneratingDeviceOrientationNotifications()
    let center = NotificationCenter.default
    for name in [UIDevice.orientationDidChangeNotification, UIScene.didActivateNotification] {
      observers.append(
        center.addObserver(forName: name, object: nil, queue: .main) { [weak self] _ in
          self?.observeRootView()
          self?.emitNowAndAfterSettling()
        })
    }
  }

  private func stopRefreshing() {
    guard !observers.isEmpty else { return }
    observers.forEach(NotificationCenter.default.removeObserver)
    observers.removeAll()
    UIDevice.current.endGeneratingDeviceOrientationNotifications()
  }

  private func emitNowAndAfterSettling() {
    emitChanges()
    DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { [weak self] in self?.emitChanges() }
  }

  private func emitChanges() {
    let fold = foldable.getFoldState(in: observedView) as NSDictionary
    if fold != lastFoldState {
      lastFoldState = fold
      sendEvent("onFoldStateChange", fold as? [String: Any] ?? [:])
    }
    let hinge = foldable.getHingeAngle() as NSDictionary
    if hinge != lastHingeAngle {
      lastHingeAngle = hinge
      sendEvent("onHingeAngleChange", hinge as? [String: Any] ?? [:])
    }
  }

  private static func rootView() -> UIView? {
    UIApplication.shared.connectedScenes
      .compactMap { $0 as? UIWindowScene }
      .flatMap(\.windows)
      .first(where: \.isKeyWindow)?
      .rootViewController?
      .view
  }
}
