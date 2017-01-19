
var React = require('react-native');
var Dimensions = require('Dimensions');

var {
  width: deviceWidth,
  height: deviceHeight
} = Dimensions.get('window');

var {
  Animated,
  StyleSheet,
  Text,
  View,
  Image,
  AppRegistry,
  TouchableWithoutFeedback,
  ScrollView,
  PanResponder
} = React;

var SHAPE_WIDTH = 100;
var SHAPE_HEIGHT = 100;


var Square = React.createClass({
    render: function() {
        return (
            <View style={styles.square} />
        )
    }
});

var Rectangle = React.createClass({
    render: function() {
        return (
            <View style={styles.rectangle} />
        )
    }
});


exports.Circle = React.createClass({
    render: function() {
        return (
            <View style={styles.circle} />
        )
    }
})

var Oval = React.createClass({
    render: function() {
        return (
            <View style={styles.oval} />
        )
    }
});

var Triangle = React.createClass({
  render: function() {
    return (
      <View style={[styles.triangle, this.props.style]} />
    )
  }
})

var TriangleUp = React.createClass({
  render: function() {
    return (
      <Triangle style={this.props.style}/>
    )
  }
})

var TriangleLeft = React.createClass({
  render: function() {
    return (
      <Triangle style={[styles.triangleLeft, this.props.style]}/>
    )
  }
})

var TriangleRight = React.createClass({
  render: function() {
    return (
      <Triangle style={[styles.triangleRight,this.props.style]}/>
    )
  }
})

var TriangleDown = React.createClass({
  render: function() {
    return (
      <Triangle style={[styles.triangleDown, this.props.style]}/>
    )
  }
})

var TriangleCorner = React.createClass({
  render: function() {
    return (
      <View style={[styles.triangleCorner, this.props.style]} />
    )
  }
})


var TriangleCornerTopRight = React.createClass({
  render: function() {
    return (
      <TriangleCorner style={[styles.triangleCornerTopRight, this.props.style]}/>
    )
  }
})

var TriangleCornerBottomLeft = React.createClass({
  render: function() {
    return (
      <TriangleCorner style={styles.triangleCornerBottomLeft}/>
    )
  }
})

var TriangleCornerBottomRight = React.createClass({
  render: function() {
    return (
      <TriangleCorner style={styles.triangleCornerBottomRight}/>
    )
  }
})

var CurvedTailArrow = React.createClass({
  render: function() {
    return (
      <View style={styles.curvedTailArrow}>
        <View style={styles.curvedTailArrowTail} />
        <View style={styles.curvedTailArrowTriangle} />
      </View>
    )
  }
})

var Trapezoid = React.createClass({
  render: function() {
    return (
      <View style={styles.trapezoid} />
    )
  }
})

var Parallelogram = React.createClass({
  render: function() {
    return (
      <View style={styles.parallelogram}>
        <TriangleUp style={styles.parallelogramRight} />
        <View style={styles.parallelogramInner} />
        <TriangleDown style={styles.parallelogramLeft} />
      </View>
    )
  }
})

var StarSix = React.createClass({
  render: function() {
    return (
      <View style={styles.starsix}>
        <TriangleUp style={styles.starSixUp} />
        <TriangleDown style={styles.starSixDown} />
      </View>
    )
  }
})

var StarFive = React.createClass({
  render: function() {
    return (
      <View style={styles.starfive}>
        <TriangleUp style={styles.starfiveTop} />
        <View style={styles.starfiveBefore} />
        <View style={styles.starfiveAfter} />
      </View>
    )
  }
})

var Pentagon = React.createClass({
  render: function() {
    return (
      <View style={styles.pentagon}>
        <View style={styles.pentagonInner} />
        <View style={styles.pentagonBefore} />
      </View>
    )
  }
})

var Hexagon = React.createClass({
  render: function() {
    return (
      <View style={styles.hexagon}>
        <View style={styles.hexagonInner} />
        <View style={styles.hexagonBefore} />
        <View style={styles.hexagonAfter} />
      </View>
    )
  }
})

var Octagon = React.createClass({
  render: function() {
    return (
      <View style={styles.octagon}>
        <View style={[styles.octagonUp, styles.octagonBar]} />
        <View style={[styles.octagonFlat, styles.octagonBar]} />
        <View style={[styles.octagonLeft, styles.octagonBar]} />
        <View style={[styles.octagonRight, styles.octagonBar]} />
      </View>
    )
  }
})

var Diamond = React.createClass({
  render: function() {
    return (
      <View style={styles.diamond} />
    )
  }
})

var DiamondShield = React.createClass({
  render: function() {
    return (
      <View style={styles.diamondShield}>
        <View style={styles.diamondShieldTop} />
        <View style={styles.diamondShieldBottom} />
      </View>
    )
  }
})

var DiamondNarrow = React.createClass({
  render: function() {
    return (
      <View style={styles.diamondNarrow}>
        <View style={styles.diamondNarrowTop} />
        <View style={styles.diamondNarrowBottom} />
      </View>
    )
  }
})

var CutDiamond = React.createClass({
  render: function() {
    return (
      <View style={styles.cutDiamond}>
        <View style={styles.cutDiamondTop} />
        <View style={styles.cutDiamondBottom} />
      </View>
    )
  }
})

var PacMan = React.createClass({
  render: function() {
    return (
      <View style={styles.pacman}/>
    )
  }
});

var TalkBubble = React.createClass({
  render: function() {
    return (
      <View style={styles.talkBubble}>
        <View style={styles.talkBubbleSquare} />
        <View style={styles.talkBubbleTriangle} />
      </View>
    )
  }
})


var TwelvePointBurst = React.createClass({
  render: function() {
    return (
      <View style={styles.twelvePointBurst}>
        <View style={styles.twelvePointBurstMain} />
        <View style={styles.twelvePointBurst30} />
        <View style={styles.twelvePointBurst60} />
      </View>
    )
  }
})

var EightPointBurst = React.createClass({
  render: function() {
    return (
      <View style={styles.eightPointBurst}>
        <View style={styles.eightPointBurst20} />
        <View style={styles.eightPointBurst155} />
      </View>
    )
  }
})

var BadgeRibbon = React.createClass({
  render: function() {
    return (
      <View style={styles.badgeRibbon}>
        <View style={styles.badgeRibbonCircle} />
        <View style={styles.badgeRibbonNeg140} />
        <View style={styles.badgeRibbon140} />
      </View>
    )
  }
})


var MagnifyingGlass = React.createClass({
  render: function() {
    return (
      <View style={styles.magnifyingGlass}>
        <View style={styles.magnifyingGlassCircle} />
        <View style={styles.magnifyingGlassStick} />
      </View>
    )
  }
})

var Cone = React.createClass({
  render: function() {
    return (
      <View style={styles.cone} />
    )
  }
})

var Cross = React.createClass({
  render: function() {
    return (
      <View style={styles.cross}>
        <View style={styles.crossUp} />
        <View style={styles.crossFlat} />
      </View>
    )
  }
})

var Base = React.createClass({
  render: function() {
    return (
      <View style={styles.base}>
        <View style={styles.baseTop} />
        <View style={styles.baseBottom} />
      </View>
    )
  }
})

var Flag = React.createClass({
  render: function() {
    return (
      <View style={styles.flag}>
        <View style={styles.flagTop} />
        <View style={styles.flagBottom} />
      </View>
    )
  }
})

var Egg = React.createClass({
  render: function() {
    return (
      <View style={styles.egg} />
    )
  }
})

var Infinity = React.createClass({
  render: function() {
    return (
      <View style={styles.infinity}>
        <View style={styles.infinityBefore} />
        <View style={styles.infinityAfter} />
      </View>
    )
  }
})

var YinYang = React.createClass({
  render: function() {
    return (
      <View style={styles.yinyang}>
        <View style={styles.yinyangMain} />
        <View style={styles.yinyangBefore} />
        <View style={styles.yinyangAfter} />
      </View>
    )
  }
})

var Facebook = React.createClass({
  render: function() {
    return (
      <View style={styles.facebook}>
        <View style={styles.facebookMain}>
          <View style={styles.facebookCurve} />
          <View style={styles.facebookBefore} />
          <View style={styles.facebookAfter} />
          <View style={styles.facebookRedCover} />
        </View>
      </View>
    )
  }
})

var Chevron = React.createClass({
  render: function() {
    return (
      <View style={styles.chevron}>
        <View style={styles.chevronMain} />
        <View style={[styles.chevronTriangle, styles.chevronTopLeft]} />
        <View style={[styles.chevronTriangle, styles.chevronTopRight]} />
        <View style={[styles.chevronTriangle, styles.chevronBottomLeft]} />
        <View style={[styles.chevronTriangle, styles.chevronBottomRight]} />
      </View>
    )
  }
})

var TvScreen = React.createClass({
  render: function() {
    return (
      <View style={styles.tvscreen}>
        <View style={styles.tvscreenMain} />
        <View style={styles.tvscreenTop} />
        <View style={styles.tvscreenBottom} />
        <View style={styles.tvscreenLeft} />
        <View style={styles.tvscreenRight} />

      </View>
    )
  }
})

var Heart = React.createClass({
    render: function() {
        return (
            <View style={styles.heart}>
                <View style={[styles.heartShape, styles.leftHeart]} />
                <View style={[styles.heartShape, styles.rightHeart]} />
            </View>
        )
    }
})

var Shapes = React.createClass({
  getInitialState() {
    return {};
  },
  render() {
    return (
      <View style={[styles.container]}>
        <ScrollView style={styles.container}>
          <View style={styles.center}>
            <Spacing />
            <Square />
            <Spacing />
            <Rectangle />
            <Spacing />
            <Circle />
            <Spacing />
            <Oval />
            <Spacing />
            <TriangleUp />
            <Spacing />
            <TriangleDown />
            <Spacing />
            <TriangleLeft />
            <Spacing />
            <TriangleRight />
            <Spacing />
            <TriangleCorner />
            <Spacing />
            <TriangleCornerTopRight />
            <Spacing />
            <TriangleCornerBottomLeft />
            <Spacing />
            <TriangleCornerBottomRight />
            <Spacing />
            <CurvedTailArrow />
            <Spacing />
            <Trapezoid />
            <Spacing />
            <Parallelogram />
            <Spacing />
            <StarSix />
            <Spacing />
            <Spacing />
            <Spacing />
            <StarFive />
            <Spacing />
            <Spacing />
            <Pentagon />
            <Spacing />
            <Spacing />
            <Hexagon />
            <Spacing />
            <Spacing />
            <Octagon />
            <Spacing />
            <Heart />
            <Spacing />
            <Infinity />
            <Spacing />
            <Diamond />
            <Spacing />
            <Spacing />
            <DiamondShield />
            <Spacing />
            <Spacing />
            <DiamondNarrow />
            <Spacing />
            <Spacing />
            <Spacing />
            <Spacing />
            <Spacing />
            <Spacing />
            <CutDiamond />
            <Spacing />
            <Egg />
            <Spacing />
            <PacMan />
            <Spacing />
            <TalkBubble />
            <Spacing />
            <TwelvePointBurst />
            <Spacing />
            <Spacing />
            <EightPointBurst />
            <Spacing />
            <YinYang />
            <Spacing />
            <BadgeRibbon />
            <Spacing />
            <Spacing />
            <Spacing />
            <TvScreen />
            <Spacing />
            <Spacing />
            <Spacing />
            <Chevron />
            <Spacing />
            <Spacing />
            <MagnifyingGlass />
            <Spacing />
            <Spacing />
            <Facebook />
            <Spacing />
            <Flag />
            <Spacing />
            <Cone />
            <Spacing />
            <Cross />
            <Spacing />
            <Spacing />
            <Spacing />
            <Base />
          </View>
        </ScrollView>
      </View>
    );
  }
});

var Spacing = React.createClass({
  render: function () {
    return (
      <View style={styles.spacing} />
    )
  }
});


var styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    flex: 1,
  },
  spacing: {
    marginTop: 10,
    marginBottom: 10
  },
  square: {
    width: 100,
    height: 100,
    backgroundColor: 'red'
  },
  rectangle: {
    width: 100 * 2,
    height: 100,
    backgroundColor: 'red'
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 100/2,
    backgroundColor: 'red'
  },
  oval: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'red',
    transform: [
      {scaleX: 2}
    ]
  },

  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 50,
    borderRightWidth: 50,
    borderBottomWidth: 100,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'red'
  },
  triangleLeft: {
    transform: [
      {rotate: '-90deg'}
    ]
  },
  triangleRight: {
    transform: [
      {rotate: '90deg'}
    ]
  },
  triangleDown: {
    transform: [
      {rotate: '180deg'}
    ]
  },
  triangleCorner: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRightWidth: 100,
    borderTopWidth: 100,
    borderRightColor: 'transparent',
    borderTopColor: 'red'
  },

  triangleCornerTopRight: {
    transform: [
      {rotate: '90deg'}
    ]
  },
  triangleCornerBottomLeft: {
    transform: [
      {rotate: '270deg'}
    ]
  },
  triangleCornerBottomRight: {
    transform: [
      {rotate: '180deg'}
    ]
  },
  curvedTailArrow: {
    backgroundColor: 'transparent',
    overflow: 'visible',
    width: 30,
    height: 25
  },
  curvedTailArrowTriangle: {
    backgroundColor: 'transparent',
    width: 0,
    height: 0,
    borderTopWidth: 9,
    borderTopColor: 'transparent',
    borderRightWidth: 9,
    borderRightColor: 'red',
    borderStyle: 'solid',
    transform: [
      {rotate: '10deg'}
    ],
    position: 'absolute',
    bottom: 9,
    right: 3,
    overflow: 'visible'
  },
  curvedTailArrowTail: {
    backgroundColor: 'transparent',
    position: 'absolute',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 3,
    borderTopColor: 'red',
    borderStyle: 'solid',
    borderTopLeftRadius: 12,
    borderBottomRightRadius: 12,
    top: 1,
    left: 0,
    width: 20,
    height: 20,
    transform: [
      {rotate: '45deg'}
    ]
  },
  trapezoid: {
    width: 200,
    height: 0,
    borderBottomWidth: 100,
    borderBottomColor: 'red',
    borderLeftWidth: 50,
    borderLeftColor: 'transparent',
    borderRightWidth: 50,
    borderRightColor: 'transparent',
    borderStyle: 'solid'
  },
  parallelogram: {
    width: 150,
    height: 100
  },
  parallelogramInner: {
    position: 'absolute',
    left: 0,
    top: 0,
    backgroundColor: 'red',
    width: 150,
    height: 100,
  },
  parallelogramRight: {
    top: 0,
    right: -50,
    position: 'absolute'
  },
  parallelogramLeft: {
    top: 0,
    left: -50,
    position: 'absolute'
  },
  starsix: {
    width: 100,
    height: 100
  },
  starSixUp: {
    position: 'absolute',
    top: 0,
    left: 0
  },
  starSixDown: {
    position: 'absolute',
    top: 25,
    left: 0
  },

  starfive: {
    width: 150,
    height: 150,
  },
  starfiveTop: {
    position: 'absolute',
    top: -45,
    left: 37
  },
  starfiveBefore: {
    backgroundColor: 'transparent',
    position: 'absolute',
    left: 0,
    top: 0,
    borderStyle: 'solid',
    borderRightWidth: 100,
    borderRightColor: 'transparent',
    borderBottomWidth: 70,
    borderBottomColor: 'red',
    borderLeftWidth: 100,
    borderLeftColor: 'transparent',
    transform: [
      { rotate: '35deg'}
    ]
  },
  starfiveAfter: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: -25,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderRightWidth: 100,
    borderRightColor: 'transparent',
    borderBottomWidth: 70,
    borderBottomColor: 'red',
    borderLeftWidth: 100,
    borderLeftColor: 'transparent',
    transform: [
      { rotate: '-35deg'}
    ]
  },
  pentagon: {
    backgroundColor: 'transparent'
  },
  pentagonInner: {
    width: 90,
    borderBottomColor: 'red',
    borderBottomWidth: 0,
    borderLeftColor: 'transparent',
    borderLeftWidth: 18,
    borderRightColor: 'transparent',
    borderRightWidth: 18,
    borderTopColor: 'red',
    borderTopWidth: 50
  },
  pentagonBefore: {
    position: 'absolute',
    height: 0,
    width: 0,
    top: -35,
    left: 0,
    borderStyle: 'solid',
    borderBottomColor: 'red',
    borderBottomWidth: 35,
    borderLeftColor: 'transparent',
    borderLeftWidth: 45,
    borderRightColor: 'transparent',
    borderRightWidth: 45,
    borderTopWidth: 0,
    borderTopColor: 'transparent',
  },
  hexagon: {
    width: 100,
    height: 55
  },
  hexagonInner: {
    width: 100,
    height: 55,
    backgroundColor: 'red'
  },
  hexagonAfter: {
    position: 'absolute',
    bottom: -25,
    left: 0,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderLeftWidth: 50,
    borderLeftColor: 'transparent',
    borderRightWidth: 50,
    borderRightColor: 'transparent',
    borderTopWidth: 25,
    borderTopColor: 'red'
  },
  hexagonBefore: {
    position: 'absolute',
    top: -25,
    left: 0,
    width: 0,
    height: 0,
    borderStyle: 'solid',
    borderLeftWidth: 50,
    borderLeftColor: 'transparent',
    borderRightWidth: 50,
    borderRightColor: 'transparent',
    borderBottomWidth: 25,
    borderBottomColor: 'red'

  },
  octagon: {},
  octagonBar: {
    width: 42,
    height: 100,
    backgroundColor: 'red'
  },
  octagonUp: {},
  octagonFlat: {
    position: 'absolute',
    top: 0,
    left: 0,
    transform: [
      {rotate: '90deg'}
    ]
  },
  octagonLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    transform: [
      {rotate: '-45deg'}
    ]
  },
  octagonRight: {
    position: 'absolute',
    top: 0,
    left: 0,
    transform: [
      {rotate: '45deg'}
    ]
  },
  diamond:{
    width: 50,
    height: 50,
    backgroundColor: 'red',
    transform: [
      {rotate: '45deg'}
    ]
  },
  diamondShield: {
    width: 100,
    height: 100
  },
  diamondShieldTop: {
    width: 0,
    height: 0,
    borderTopWidth: 50,
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    borderLeftWidth: 50,
    borderRightColor: 'transparent',
    borderRightWidth: 50,
    borderBottomColor: 'red',
    borderBottomWidth: 20,
  },
  diamondShieldBottom: {
    width: 0,
    height: 0,
    borderTopWidth: 70,
    borderTopColor: 'red',
    borderLeftColor: 'transparent',
    borderLeftWidth: 50,
    borderRightColor: 'transparent',
    borderRightWidth: 50,
    borderBottomColor: 'transparent',
    borderBottomWidth: 50,
  },
  diamondNarrow: {
    width: 100,
    height: 100
  },
  diamondNarrowTop: {
    width: 0,
    height: 0,
    borderTopWidth: 50,
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    borderLeftWidth: 50,
    borderRightColor: 'transparent',
    borderRightWidth: 50,
    borderBottomColor: 'red',
    borderBottomWidth: 70,
  },
  diamondNarrowBottom: {
    width: 0,
    height: 0,
    borderTopWidth: 70,
    borderTopColor: 'red',
    borderLeftColor: 'transparent',
    borderLeftWidth: 50,
    borderRightColor: 'transparent',
    borderRightWidth: 50,
    borderBottomColor: 'transparent',
    borderBottomWidth: 50,
  },
  cutDiamond: {
    width: 100,
    height: 100,
  },
  cutDiamondTop: {
    width: 100,
    height: 0,
    borderTopWidth: 0,
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    borderLeftWidth: 25,
    borderRightColor: 'transparent',
    borderRightWidth: 25,
    borderBottomColor: 'red',
    borderBottomWidth: 25,
  },
  cutDiamondBottom: {
    width: 0,
    height: 0,
    borderTopWidth: 70,
    borderTopColor: 'red',
    borderLeftColor: 'transparent',
    borderLeftWidth: 50,
    borderRightColor: 'transparent',
    borderRightWidth: 50,
    borderBottomColor: 'transparent',
    borderBottomWidth: 0,
  },
  pacman: {
    width: 0,
    height: 0,
    borderTopWidth: 60,
    borderTopColor: 'red',
    borderLeftColor: 'red',
    borderLeftWidth: 60,
    borderRightColor: 'transparent',
    borderRightWidth: 60,
    borderBottomColor: 'red',
    borderBottomWidth: 60,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    borderBottomRightRadius: 60,
    borderBottomLeftRadius: 60
  },
  talkBubble: {
    backgroundColor: 'transparent'
  },
  talkBubbleSquare: {
    width: 120,
    height: 80,
    backgroundColor: 'red',
    borderRadius: 10
  },
  talkBubbleTriangle: {
    position: 'absolute',
    left: -26,
    top: 26,
    width: 0,
    height: 0,
    borderTopColor: 'transparent',
    borderTopWidth: 13,
    borderRightWidth: 26,
    borderRightColor: 'red',
    borderBottomWidth: 13,
    borderBottomColor: 'transparent'
  },
  twelvePointBurst: {},
  twelvePointBurstMain: {
    width: 80,
    height: 80,
    backgroundColor: 'red'
  },
  twelvePointBurst30: {
    width: 80,
    height: 80,
    position: 'absolute',
    backgroundColor: 'red',
    top: 0,
    right: 0,
    transform: [
      {rotate: '30deg'}
    ]
  },
  twelvePointBurst60: {
    width: 80,
    height: 80,
    position: 'absolute',
    backgroundColor: 'red',
    top: 0,
    right: 0,
    transform: [
      {rotate: '60deg'}
    ]
  },
  eightPointBurst: {},
  eightPointBurst20: {
    width: 80,
    height: 80,
    backgroundColor: 'red',
    transform: [
      {rotate: '20deg'}
    ]
  },
  eightPointBurst155: {
    width: 80,
    height: 80,
    position: 'absolute',
    backgroundColor: 'red',
    top: 0,
    left: 0,
    transform: [
      {rotate: '155deg'}
    ]
  },
  badgeRibbonCircle: {
    width: 100,
    height: 100,
    backgroundColor: 'red',
    borderRadius: 50
  },
  badgeRibbon140: {
    backgroundColor:'transparent',
    borderBottomWidth: 70,
    borderBottomColor: 'red',
    borderLeftWidth: 40,
    borderLeftColor: 'transparent',
    borderRightWidth: 40,
    borderRightColor: 'transparent',
    position: 'absolute',
    top: 70,
    right: -10,
    transform: [
      {rotate: '140deg'}
    ]
  },
  badgeRibbonNeg140: {
    backgroundColor:'transparent',
    borderBottomWidth: 70,
    borderBottomColor: 'red',
    borderLeftWidth: 40,
    borderLeftColor: 'transparent',
    borderRightWidth: 40,
    borderRightColor: 'transparent',
    position: 'absolute',
    top: 70,
    left: -10,
    transform: [
      {rotate: '-140deg'}
    ]
  },
  tvscreen: {},
  tvscreenMain: {
    width: 150,
    height: 75,
    backgroundColor: 'red',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    borderBottomLeftRadius: 15,
  },
  tvscreenTop: {
    width: 73,
    height: 70,
    backgroundColor: 'red',
    position: 'absolute',
    top: -26,
    left: 39,
    borderRadius: 35,
    transform: [
      {scaleX: 2},
      {scaleY: .5}
    ]
  },
  tvscreenBottom: {
    width: 73,
    height: 70,
    backgroundColor: 'red',
    position: 'absolute',
    bottom: -26,
    left: 39,
    borderRadius: 35,
    transform: [
      {scaleX: 2},
      {scaleY: .5}
    ]
  },
  tvscreenLeft: {
    width: 20,
    height: 38,
    backgroundColor: 'red',
    position: 'absolute',
    left: -7,
    top: 18,
    borderRadius: 35,
    transform: [
      {scaleX: .5},
      {scaleY: 2},
    ]
  },
  tvscreenRight: {
    width: 20,
    height: 38,
    backgroundColor: 'red',
    position: 'absolute',
    right: -7,
    top: 18,
    borderRadius: 35,
    transform: [
      {scaleX: .5},
      {scaleY: 2},
    ]
  },
  magnifyingGlass: {

  },
  magnifyingGlassCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 15,
    borderColor: 'red'
  },
  magnifyingGlassStick: {
    position: 'absolute',
    right: -20,
    bottom: -10,
    backgroundColor: 'red',
    width: 50,
    height: 10,
    transform: [
      {rotate: '45deg'}
    ]
  },
  cone: {
    width: 0,
    height: 0,
    borderLeftWidth: 55,
    borderLeftColor: 'transparent',
    borderRightWidth: 55,
    borderRightColor: 'transparent',
    borderTopWidth: 100,
    borderTopColor: 'red',
    borderRadius: 55
  },
  cross: {

  },
  crossUp: {
    backgroundColor: 'red',
    height: 100,
    width: 20
  },
  crossFlat: {
    backgroundColor: 'red',
    height: 20,
    width: 100,
    position: 'absolute',
    left: -40,
    top: 40
  },
  base: {

  },
  baseTop: {
    borderBottomWidth: 35,
    borderBottomColor: 'red',
    borderLeftWidth: 50,
    borderLeftColor: 'transparent',
    borderRightWidth: 50,
    borderRightColor: 'transparent',
    height: 0,
    width: 0,
    left: 0,
    top: -35,
    position: 'absolute',
  },
  baseBottom: {
    backgroundColor: 'red',
    height: 55,
    width: 100
  },
  flag: {},
  flagTop: {
    width: 110,
    height: 56,
    backgroundColor: 'red',
  },
  flagBottom: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 0,
    height: 0,
    borderBottomWidth: 13,
    borderBottomColor: 'transparent',
    borderLeftWidth: 55,
    borderLeftColor: 'red',
    borderRightWidth: 55,
    borderRightColor: 'red'
  },
  egg: {
    width: 126,
    height: 180,
    backgroundColor: 'red',
    borderTopLeftRadius: 108,
    borderTopRightRadius: 108,
    borderBottomLeftRadius: 95,
    borderBottomRightRadius: 95
  },
  infinity: {
    width: 80,
    height: 100,
  },
  infinityBefore: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    borderWidth: 20,
    borderColor: 'red',
    borderStyle: 'solid',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomRightRadius: 50,
    borderBottomLeftRadius: 0,
    transform: [
      {rotate: '-135deg'}
    ]
  },
  infinityAfter: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    borderWidth: 20,
    borderColor: 'red',
    borderStyle: 'solid',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 50,
    borderBottomLeftRadius: 50,
    transform: [
      {rotate: '-135deg'}
    ]
  },

  yinyang: {

  },
  yinyangMain: {
    width: 100,
    height: 100,
    borderColor: 'red',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderBottomWidth: 50,
    borderRightWidth: 2,
    borderRadius: 50
  },
  yinyangBefore: {
    position: 'absolute',
    top: 24,
    left: 0,
    borderColor: 'red',
    borderWidth: 24,
    borderRadius: 30,
  },
  yinyangAfter: {
    position: 'absolute',
    top: 24,
    right: 2,
    backgroundColor: 'red',
    borderColor: 'white',
    borderWidth: 25,
    borderRadius: 30,
  },
  facebook: {
    width: 100,
    height: 110,
  },
  facebookMain: {
    backgroundColor: 'red',
    width: 100,
    height: 110,
    borderRadius: 5,
    borderColor: 'red',
    borderTopWidth: 15,
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 0,
    overflow: 'hidden'

  },
  facebookRedCover: {
    width: 10,
    height: 20,
    backgroundColor: 'red',
    position: 'absolute',
    right: 0,
    top: 5
  },
  facebookCurve: {
    width: 50,
    borderWidth: 20,
    borderTopWidth: 20,
    borderTopColor: 'white',
    borderBottomColor: 'transparent',
    borderLeftColor: 'white',
    borderRightColor: 'transparent',
    borderRadius: 20,
    position: 'absolute',
    right: -8,
    top: 5
  },
  facebookBefore: {
    position: 'absolute',
    backgroundColor: 'white',
    width: 20,
    height: 70,
    bottom: 0,
    right: 22,
  },
  facebookAfter: {
    position: 'absolute',
    width: 55,
    top: 50,
    height: 20,
    backgroundColor: 'white',
    right: 5
  },
  chevron: {
    width: 150,
    height: 50
  },
  chevronMain: {
    width: 150,
    height: 50,
    backgroundColor: 'red'
  },
  chevronTriangle: {
    backgroundColor: 'transparent',
    borderTopWidth: 20,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 75,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
    borderLeftColor: 'red',
  },
  chevronTopLeft: {
    position: 'absolute',
    top: -20,
    left: 0
  },
  chevronTopRight: {
    position: 'absolute',
    top: -20,
    right: 0,
    transform: [
      {scaleX: -1}
    ]
  },
  chevronBottomLeft: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    transform: [
      {scale: -1 }
    ]
  },
  chevronBottomRight: {
    position: 'absolute',
    bottom: -20,
    right: 0,
    transform: [
      {scaleY: -1}
    ]
  },
  heart: {
    width: 50,
    height: 50
  },
  heartShape: {
    width: 30,
    height: 45,
    position: 'absolute',
    top: 0,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    backgroundColor: 'red',
  },
  leftHeart: {
    transform: [
        {rotate: '-45deg'}
    ],
    left: 5
  },
  rightHeart: {
    transform: [
        {rotate: '45deg'}
    ],
    right: 5
  }
})
