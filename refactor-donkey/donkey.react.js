/**
 * Created by Cody on 2/15/2015.
 */

;(function(Game,undefined) {
    function DonkeyReact() {
/*
        function makeElement(node) {
            return React.DOM.div({
                className: node.id,
                style: {
                    left: (node.x + (node.baseX || 0)) | 0 + "px",
                    top: (node.y + (node.baseY || 0)) | 0 + "px"
                }
            }, node.text);
        }

        function renderScene(nodes) {
            return React.renderComponent(
                React.DOM.div(null, nodes.map(makeElement)),
                Game.canvas
            );
        }

        return {
            renderScene : renderScene
        }
        */
    }
    Game.DonkeyReact = DonkeyReact;
}(window.Game));
