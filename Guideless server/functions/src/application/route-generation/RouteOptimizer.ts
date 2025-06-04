import { RouteType } from "../../domain/interfaces/IRoute";
import { RouteState } from "../../domain/models/RouteState";
import { FixedEndOptimizer } from "../../strategies/optimization/FixedEndOptimizer";
import { LooseEndOptimizer } from "../../strategies/optimization/LooseEndOptimize";

export class RouteOptimizer {
    public static optimize(routeState: RouteState): RouteState {
        if (routeState.route.type === RouteType.ANYWHERE) {
            return LooseEndOptimizer.optimize(routeState);
        }
        return FixedEndOptimizer.optimize(routeState);
    }
}